require('dotenv').config();
const { getMergedPRs, formatPRs, generateMarkdownDoc } = require('../utils');

async function createMergedPrReport(repos, dates) {
  let reposWithPRs = [];
  let reposWithNoPRs = [];

  for (const { owner, repo, description } of repos) {
    try {
      const PRs = await getMergedPRs(
        owner,
        repo,
        dates.startDate,
        dates.endDate
      );
      if (PRs.length > 0) {
        const prList = formatPRs(PRs);
        reposWithPRs.push({ repo, prList, description });
      } else reposWithNoPRs.push({ repo });
    } catch (error) {
      console.error(`⛔️ - Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
  return generateMarkdownDoc(reposWithPRs);
}

module.exports = { createMergedPrReport };
