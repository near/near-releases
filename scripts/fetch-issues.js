require('dotenv').config();
const {
  formatDates,
  getIssues,
  formatIssues,
  generateMarkdownDoc,
  writeMarkdownFile,
} = require('../utils');
const repos = require('../data/test/test-repos').repos;
const dates = formatDates(11, 2023);

async function main() {
  console.log('\n -> L👀king for Issues in the following repositories:\n');
  let reposWithIssues = [];
  let reposWithNoIssues = [];

  for (const { owner, repo } of repos) {
    try {
      const issues = await getIssues(
        owner,
        repo,
        dates.startDate,
        dates.endDate
      );
      if (issues.length > 0) {
        const issueList = formatIssues(issues);
        reposWithIssues.push({ repo, issueList });
      } else {
        reposWithNoIssues.push(repo);
      }
      process.stdout.write(` ✅ - ${repo} \n`);
    } catch (error) {
      console.error(`⛔️ - Error fetching ${owner}/${repo}: ${error.message}`);
    }
  }
  console.log('\n 👍 All repositories checked \n');

  const markdownContent = generateMarkdownDoc(reposWithIssues, dates, 'issues');
  const reportFilename = `./reports/issues/10-${dates.twoDigitMonth}.md`;

  console.log('-------------------------------------------------\n');
  await writeMarkdownFile(reportFilename, markdownContent);

  console.log('-------------------------------------------------\n');
  console.log(` ⚠️  NO CREATED ISSUES FOUND FOR THE FOLLOWING REPOS:`);
  console.table(reposWithNoIssues);
}

main();
