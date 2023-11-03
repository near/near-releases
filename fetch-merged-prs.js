require('dotenv').config();
const axios = require('axios');
const { getDates } = require('./utils');
const repos = require('./repos').repos;

const GITHUB_API_URL = 'https://api.github.com/repos/{owner}/{repo}/pulls';
const TOKEN = process.env.GITHUB_TOKEN;

const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

// 0 = January, 11 = December
const MONTH = 6;
const YEAR = 2023;
const dates = getDates(MONTH, YEAR);
const startDate = dates.startDate;
const endDate = dates.endDate;

async function getMergedPRs(owner, repo, startDate, endDate) {
  console.log(`Checking ${repo}... `);
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
        GITHUB_API_URL.replace('{owner}', owner).replace('{repo}', repo),
        { headers, params }
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

async function main() {
  for (const { owner, repo } of repos) {
    try {
      const PRs = await getMergedPRs(owner, repo, startDate, endDate);

      //trim PR title to fit in console table
      PRs.map((row) => {
        if (row.title.length > 50) {
          row.title = row.title.substring(0, 50) + '...';
        }
        return row;
      });

      console.log(
        `${owner}/${repo} merged ${PRs.length} PRs for the month of ${dates.monthSpelled}.`
      );
      PRs.length > 0 ? console.table(PRs, ['title', 'html_url']) : '';
    } catch (error) {
      console.error(`Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
}

main();
