require('dotenv').config();
const fs = require('fs').promises;
const axios = require('axios');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { marked } = require('marked');
const { config } = require('./config');

const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
  try {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.ACCESS_CODE,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.log('*ERR: ', err);
          reject();
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        accessToken,
        clientId: 'process.env.CLIENT_ID',
        clientSecret: process.env.ACCESS_CODE,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
    return transporter;
  } catch (err) {
    return err;
  }
}

async function sendEmail(title, emailTxt) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: 'josh@near.org',
    subject: `${title}`,
    html: emailTxt,
  };
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(mailOptions);
}

async function getIssues(owner, repo, startDate, endDate) {
  const params = {
    state: 'all',
    sort: 'created',
    direction: 'desc', // ascending order to start from the earliest issues
    per_page: 100,
  };

  let response = await axios.get(
    config.GITHUB_ISSUES_API_URL.replace('{owner}', owner).replace(
      '{repo}',
      repo
    ),
    { headers: config.HEADERS, params: params }
  );
  let issues = [];
  if (response.data.length > 0) {
    response.data.forEach((issue) => {
      if (
        !issue.pull_request &&
        new Date(issue.created_at) >= startDate &&
        new Date(issue.created_at) <= endDate
      ) {
        issues.push(issue);
      }
    });
  }
  return issues;
}

async function getReleases(owner, repo, startDate, endDate) {
  let response = await axios.get(
    config.GITHUB_RELEASE_API_URL.replace('{owner}', owner).replace(
      '{repo}',
      repo
    ),
    { headers: config.HEADERS }
  );
  let releases = [];
  if (response.data.length > 0) {
    response.data.forEach((release) => {
      if (
        new Date(release.published_at) >= startDate &&
        new Date(release.published_at) <= endDate
      ) {
        releases.push(release);
      }
    });
  }
  return releases;
}

async function getMergedPRs(owner, repo, startDate, endDate) {
  const baseBranches = ['main', 'master'];
  try {
    for (const base of baseBranches) {
      const params = {
        state: 'closed',
        base: base,
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      };

      let response = await axios.get(
        config.GITHUB_PR_API_URL.replace('{owner}', owner).replace(
          '{repo}',
          repo
        ),
        { headers: config.HEADERS, params }
      );

      if (response.data.length > 0) {
        const mergedPRs = response.data.filter(
          (pr) =>
            pr.merged_at &&
            new Date(pr.merged_at) >= new Date(startDate) &&
            new Date(pr.merged_at) <= new Date(endDate)
        );
        process.stdout.write(` ✅ - ${repo} \n`);
        return mergedPRs;
      }
    }
  } catch (error) {
    console.error(
      'Error fetching PRs:',
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

function formatPRs(issues) {
  let prList = [];
  issues.forEach((pr) => {
    pr.merged_at = pr.merged_at.split('T')[0];
    if (pr.title.length > 40) {
      pr.title = pr.title.substring(0, 20) + '...';
    }
    prList.push({
      DATE: pr.merged_at,
      PR: `[${pr.number}](${pr.html_url})`,
      DESCRIPTION: `[${pr.title}](${pr.html_url})`,
    });
    return;
  });
  return prList;
}

function formatIssues(issues) {
  let issueList = [];
  issues.forEach((issue) => {
    issue.created_at = issue.created_at.split('T')[0];
    if (issue.title.length > 40) {
      issue.title = issue.title.substring(0, 50) + '...';
    }
    issueList.push({
      created_at: issue.created_at,
      num: `[${issue.number}](${issue.html_url})`,
      title: `[${issue.title}](${issue.html_url})`,
    });
    return;
  });
  return issueList;
}

function generateMarkdownTable(data) {
  if (!data.length) {
    return '# No data available.';
  }
  const headers = Object.keys(data[0]);

  let markdownTable = '';

  // Generate headers
  markdownTable += `| ${headers.join(' | ')} |\n`;
  // Generate separators
  markdownTable += `| ${headers.map(() => '---').join(' | ')} |\n`;

  // Generate table rows
  for (const item of data) {
    const row = headers.map((header) => item[header]).join(' | ');
    markdownTable += `| ${row} |\n`;
  }
  return markdownTable;
}

function generateMarkdownDoc(repos) {
  let markdownDoc = '';
  // Generate tables for issues or PRs
  repos.forEach((repo) => {
    let markdownTable = generateMarkdownTable(repo.prList);
    markdownDoc += `\n### ${repo.repo.toLowerCase()}\n\n` + markdownTable;
  });

  return markdownDoc;
}

function markdownToHtml(markdown) {
  const renderer = new marked.Renderer();

  renderer.heading = function (text, level) {
    // Create a slug from the header text
    const slug = text
      .toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/[^\w\-]+/g, '');
    return `<h${level} id="${slug}">${text}</h${level}>`;
  };
  let emailTxt = marked.parse(markdown, { renderer: renderer });
  emailTxt = emailTxt.replace(
    /<table>/g,
    '<table border="1" cellpadding="5" cellspacing="5" style="border-collapse: collapse; text-align: center;">'
  );
  return emailTxt;
}

async function writeMarkdownFile(filename, content) {
  await fs.writeFile(filename, content, 'utf8');
  console.log(` 📝 Report created @ ${filename}\n`);
}

function formatDates(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const monthSpelled = startDate.toLocaleString('default', { month: 'long' });
  const twoDigitMonth =
    endDate.getMonth() < 9
      ? `0${endDate.getMonth() + 1}`
      : `${endDate.getMonth() + 1}`;
  const markdownDate = `${endDate.getFullYear()}-${twoDigitMonth}-${endDate.getDate()}`;

  return { startDate, endDate, markdownDate, monthSpelled, twoDigitMonth };
}

function countPRs(repos) {
  let totalPRs = 0;
  repos.forEach((repo) => {
    totalPRs += repo.prList.length;
  });
  return totalPRs;
}

module.exports = {
  sendEmail,
  markdownToHtml,
  formatIssues,
  createTransporter,
  getIssues,
  generateMarkdownTable,
  generateMarkdownDoc,
  writeMarkdownFile,
  getReleases,
  getMergedPRs,
  formatDates,
  formatPRs,
  countPRs,
};
