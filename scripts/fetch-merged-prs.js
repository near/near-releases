require('dotenv').config();
const {
  getDates,
  getMergedPRs,
  writeMarkdownFile,
  generatePRsMarkdownDoc,
  formatPRs,
  countPRs,
  markdownToHtml,
  sendEmail,
} = require('../utils');
const repos = require('../data/test/test-repos').repos;
const dates = getDates(10, 2023);

async function main() {
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

  const totalPRs = countPRs(reposWithPRs);
  const markdownContent = generatePRsMarkdownDoc(reposWithPRs, dates);
  const emailTxt = markdownToHtml(markdownContent);
  const reportFilename = `./reports/merged-prs/${process.argv[3]}-${dates.twoDigitMonth}.md`;

  try {
    await writeMarkdownFile(reportFilename, markdownContent);
    const title = `🚀 NEAR Merged PRs for ${dates.monthSpelled} ${process.argv[3]}`;
    await sendEmail(title, emailTxt);
  } catch (err) {
    console.log('ERROR: ', err);
  }

  console.log('-------------------------------------------------\n');
  console.log(
    ` 🚀 ${totalPRs} merged PRs found for ${dates.monthSpelled} ${process.argv[3]}\n`
  );

  console.log('-------------------------------------------------\n');
  console.log(` ⚠️ NO MERGED PRS FOUND FOR THE FOLLOWING REPOS:`);
  console.table(reposWithNoPRs);
}

main();
