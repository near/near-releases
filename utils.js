require('dotenv').config();
const fs = require('fs').promises;
const axios = require('axios');

const GITHUB_RELEASE_API_URL =
  'https://api.github.com/repos/{owner}/{repo}/releases';
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
        new Date(release.published_at) >= new Date(startDate) &&
        new Date(release.published_at) <= new Date(endDate)
      ) {
        releases.push(release);
      }
    });
  }
  return releases;
}

function generateMarkdown(data, markdownDate) {
  if (!data.length) {
    return '# NEAR Dev Report: \n\nNo data available.';
  }

  const headers = Object.keys(data[0]);
  let markdownContent = `# NEAR Dev Releases - ${markdownDate.month} ${markdownDate.year} \n\n`;

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
  console.log(`Markdown file '${filename}' has been generated. \n`);
}

function getDates(month, year) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const monthSpelled = startDate.toLocaleString('default', { month: 'long' });
  const markdownDate = { monthSpelled, year };

  return { startDate, endDate, markdownDate, monthSpelled};
}

module.exports = {
  generateMarkdown,
  writeMarkdownFile,
  getReleases,
  getDates,
};
