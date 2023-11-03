require('dotenv').config();
const fs = require('fs').promises;
const axios = require('axios');

const GITHUB_RELEASE_API_URL = 'https://api.github.com/repos/{owner}/{repo}/releases';
const TOKEN = process.env.GITHUB_TOKEN;
const HEADERS = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

async function getLatestReleases(owner, repo) {
  const response = await axios.get(
    GITHUB_RELEASE_API_URL.replace('{owner}', owner).replace('{repo}', repo),
    { headers: HEADERS }
  );
  const releases = response.data;
  if (releases.length === 0) {
    return null;
  }
  return releases;
}

function generateMarkdown(data, oneMonthAgo) {
    if (!data.length) {
      return '# NEAR Dev Report: \n\nNo data available.';
    }
  
    const headers = Object.keys(data[0]);
    let markdownContent = `# NEAR Dev Releases - ${oneMonthAgo} \n\n`;
  
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

  module.exports = { generateMarkdown, writeMarkdownFile, getLatestReleases };