require('dotenv').config();
const { getMergedPRs, formatPRs, generateMarkdownDoc } = require('../utils');

async function createMergedPrReport(repos, dates) {
  console.log(
    '\n -> Checking \n'
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
   
  return generateMarkdownDoc(reposWithPRs);
}

module.exports = { createMergedPrReport };
