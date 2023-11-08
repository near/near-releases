require('dotenv').config();
const {
  getDates,
  getMergedPRs,
  writeMarkdownFile,
  generatePRsMarkdownDoc,
  formatPRs,
  countPRs,
} = require('./utils');
const repos = require('./data/repos').repos;
const { config } = require('./config');
const dates = getDates(config.month, config.year);

async function main() {
  console.log(
    '\n Fetching merged pull requests for the following repositories:\n'
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

  const totalPRs = countPRs(reposWithPRs);
  const markdownContent = generatePRsMarkdownDoc(reposWithPRs, dates);
  const reportFilename = `./reports/merged-prs/${config.year}-${dates.twoDigitMonth}.md`;

  console.log('-------------------------------------------------\n');
  console.log(
    ` 🚀 ${totalPRs} merged PRs found for ${dates.monthSpelled} ${config.year}\n\n`
  );

  await writeMarkdownFile(reportFilename, markdownContent);

  console.log('-------------------------------------------------\n');
  console.log(` ⚠️  NO MERGED PRS FOUND ⚠️`);
  console.table(reposWithNoPRs);
}

main();
