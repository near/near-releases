require('dotenv').config();
const { getDates, getMergedPRs } = require('./utils');
const repos = require('./repos').repos;

// 0 = January, 11 = December
const MONTH = 6;
const YEAR = 2023;
const dates = getDates(MONTH, YEAR);
const startDate = dates.startDate;
const endDate = dates.endDate;

async function main() {
  let reposWithNoPRs = [];
  let reposWithPRs = [];

  for (const { owner, repo } of repos) {
    try {
      const PRs = await getMergedPRs(owner, repo, startDate, endDate);

      if (PRs.length > 0) {
        //trim PR title
        PRs.map((row) => {
          row.merged_at = row.merged_at.split('T')[0];
          if (row.title.length > 40) {
            row.title = row.title.substring(0, 50) + '...';
          }
          return row;
        });
        reposWithPRs.push({ repo, PRs });
      } else reposWithNoPRs.push({ repo });
    } catch (error) {
      console.error(`⛔️ - Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
  const totalPRs = reposWithPRs.reduce((acc, repo) => {
    acc += repo.PRs.length;
    return acc;
  }, 0);

  console.log('\n');
  console.log(
    `🚀 ${totalPRs} merged PRs found for ${dates.monthSpelled} ${YEAR}: \n`
  );
  reposWithPRs.forEach((repo) => {
    console.log(repo.repo);
    console.table(repo.PRs, ['title', 'merged_at', 'html_url']);
  });

  console.log('\n');
  console.log(`🙅 - No merged PRs in ${dates.monthSpelled} ${YEAR} for:`);
  console.table(reposWithNoPRs);
}

main();
