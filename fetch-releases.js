require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const repos = require('./repos').repos;

const GITHUB_API_URL = 'https://api.github.com/repos/{owner}/{repo}/releases';
const TOKEN = process.env.GITHUB_TOKEN;
const HEADERS = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

async function getLatestReleases(owner, repo) {
  const response = await axios.get(
    GITHUB_API_URL.replace('{owner}', owner).replace('{repo}', repo),
    { headers: HEADERS }
  );
  const releases = response.data;
  if (releases.length === 0) {
    return null;
  }
  return new Date(releases[0].published_at);
}

function generateMarkdown(data, oneMonthAgo) {
  if (!data.length) {
    return '# NEAR Dev Report: \n\nNo data available.';
  }

  const headers = Object.keys(data[0]);
  let markdownContent = `# NEAR Dev Releases - ${oneMonthAgo} \n\n`;

  // Generate table headers
  markdownContent += `| ${headers.join(' | ')} |\n`;
  // Generate separators
  markdownContent += `| ${headers.map(() => '---').join(' | ')} |\n`;

  // Generate the table rows
  for (const item of data) {
    const row = headers.map((header) => item[header]).join(' | ');
    markdownContent += `| ${row} |\n`;
  }

  return markdownContent;
}

// Function to write markdown content to a file
async function writeMarkdownFile(filename, content) {
  await fs.writeFile(filename, content, 'utf8');
  console.log(`Markdown file '${filename}' has been generated. \n`);
}

async function main() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const formattedDate = oneMonthAgo.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  let releases = [];
  let noReleases = [];

  for (const { owner, repo } of repos) {
    try {
      const latestReleaseDate = await getLatestReleases(owner, repo);
      if (latestReleaseDate && latestReleaseDate > oneMonthAgo) {
        // const link = release[0].html_url;
        releases.push({ owner, repo });
      } else {
        noReleases.push(repo);
      }
    } catch (error) {
      console.error(`⛔️ - Error fetching ${owner}/${repo}: ${error.message}`);
    }
    console.log(`✅ - ${repo} `);
  }
  console.log('\n');
  const markdown = generateMarkdown(releases, formattedDate);
  const reportFilename = `./reports/releases/${formattedDate}.md`;
  await writeMarkdownFile(reportFilename, markdown);

  console.log('🎉 - New releases in the past month for:');
  console.table(releases);
  console.log('🙅 - No new releases in the past month for:');
  console.table(noReleases);
}

main();
