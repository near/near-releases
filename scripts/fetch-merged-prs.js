require('dotenv').config();
const { getMergedPRs, formatPRs, generateMarkdownDoc } = require('../utils');

async function createMergedPrReport(repos, dates) {
  console.log(
    '\n -> L👀king for merged pull requests for the following repositories:\n'
  );

  let reposWithPRs = [];
  let reposWithNoPRs = [];

  for (const { owner, repo } of repos) {
    try {
      const PRs = await getMergedPRs(
        owner,
        repo,
        dates.startDate,
        dates.endDate
      );
      if (PRs.length > 0) {
        const prList = formatPRs(PRs);
        reposWithPRs.push({ repo, prList });
      } else reposWithNoPRs.push({ repo });
    } catch (error) {
      console.error(`⛔️ - Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
  console.log('\n 👍 All repositories checked \n');
  let markdown = `\n## Merged Pull Requests  🚀\n`;
  markdown += generateMarkdownDoc(reposWithPRs);
  return markdown;
}

module.exports = { createMergedPrReport };
