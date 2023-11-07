require('dotenv').config();
const fs = require('fs').promises;
const axios = require('axios');

const GITHUB_RELEASE_API_URL =
  'https://api.github.com/repos/{owner}/{repo}/releases';
const GITHUB_PR_API_URL = 'https://api.github.com/repos/{owner}/{repo}/pulls';
const TOKEN = process.env.GITHUB_TOKEN;
const HEADERS = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

async function getReleases(owner, repo, startDate, endDate) {
  let response = await axios.get(
    GITHUB_RELEASE_API_URL.replace('{owner}', owner).replace('{repo}', repo),
    { headers: HEADERS }
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
  console.log(`🔎 checking ${repo}...`);
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
        GITHUB_PR_API_URL.replace('{owner}', owner).replace('{repo}', repo),
        { headers: HEADERS, params }
      );

      if (response.data.length > 0) {
        const mergedPRs = response.data.filter(
          (pr) =>
            pr.merged_at &&
            new Date(pr.merged_at) >= new Date(startDate) &&
            new Date(pr.merged_at) <= new Date(endDate)
        );
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

function generateMarkdown(data) {
  console.log(data);
  if (!data.length) {
    return '# NEAR Dev Report: \n\nNo data available.';
  }
  // console.log(data)
  const headers = Object.keys(data[0]);

  let markdownContent = '';

  // Generate headers
  markdownContent += `| ${headers.join(' | ')} |\n`;
  // Generate separators
  markdownContent += `| ${headers.map(() => '---').join(' | ')} |\n`;

  // Generate table rows
  for (const item of data) {
    const row = headers.map((header) => item[header]).join(' | ');
    markdownContent += `| ${row} |\n`;
  }
  return markdownContent;
}

async function writeMarkdownFile(filename, content) {
  await fs.writeFile(filename, content, 'utf8');
  console.log(` 🚀 Report created @ '${filename} \n\n`);
}

function getDates(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const monthSpelled = startDate.toLocaleString('default', { month: 'long' });
  const twoDigitMonth = month < 10 ? `0${month}` : month;
  const markdownDate = { monthSpelled, year };

  return { startDate, endDate, markdownDate, monthSpelled, twoDigitMonth };
}

module.exports = {
  generateMarkdown,
  writeMarkdownFile,
  getReleases,
  getMergedPRs,
  getDates,
};
