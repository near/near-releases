require('dotenv').config();
const axios = require('axios');
const repos = require('./repos').repos;

const GITHUB_API_URL = 'https://api.github.com/repos/{owner}/{repo}/releases';
const TOKEN = process.env.GITHUB_TOKEN;
const HEADERS = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

async function getLatestReleaseDate(owner, repo) {
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

async function main() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  let releases = []
  let noReleases = [];

  for (const { owner, repo } of repos) {
    try {
      const latestReleaseDate = await getLatestReleaseDate(owner, repo);
      if (latestReleaseDate && latestReleaseDate > oneMonthAgo) {
        releases.push({ owner, repo, latestReleaseDate});
      } else {
        noReleases.push(repo);
      }
    } catch (error) {
      console.error(`Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
  console.log('New releases in the past month for:');
  console.table(releases);
  console.log('No new releases in the past month for:');
  console.table(noReleases);
}

main();
git