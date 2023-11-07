require('dotenv').config();
const {
  getDates,
  getMergedPRs,
  generateMarkdown,
  writeMarkdownFile,
} = require('./utils');
const repos = require('./repos').repos;

const MONTH = 10;
const YEAR = 2023;
const dates = getDates(MONTH, YEAR);
const startDate = dates.startDate;
const endDate = dates.endDate;

async function main() {
  console.log(
    '\n Fetching merged pull requests for the following repositories:\n'
  );
  let reposWithNoPRs = [];
  let reposWithPRs = [];

  for (const { owner, repo } of repos) {
    try {
      const PRs = await getMergedPRs(owner, repo, startDate, endDate);
      if (PRs.length > 0) {
        let prList = [];
        PRs.forEach((pr) => {
          pr.merged_at = pr.merged_at.split('T')[0];
          if (pr.title.length > 40) {
            pr.title = pr.title.substring(0, 50) + '...';
          }
          prList.push({
            merged_at: pr.merged_at,
            num: `[${pr.number}](${pr.html_url})`,
            title: `[${pr.title}](${pr.html_url})`,
          });
          return;
        });
        reposWithPRs.push({ repo, prList });
      } else reposWithNoPRs.push({ repo });
    } catch (error) {
      console.error(`⛔️ - Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
  console.log('\n 👍 All repositories checked \n');
  console.log('-------------------------------------------------\n');
  const totalPRs = reposWithPRs.reduce((acc, repo) => {
    acc += repo.prList.length;
    return acc;
  }, 0);

  console.log(
    ` 🚀 ${totalPRs} merged PRs found for ${dates.monthSpelled} ${YEAR}\n\n`
  );

  let markdownContent = `# NEAR Merged Pull Requests for ${dates.markdownDate.monthSpelled} ${dates.markdownDate.year}\n\n`;

  // Generate Table of Contents
  markdownContent += `## Table of Contents\n\n`;
  reposWithPRs.forEach((repo) => {
    markdownContent += `- [${repo.repo.toUpperCase()}](#${repo.repo})\n`;
  });

  markdownContent += `\n-------------------------------------------------\n`;

  reposWithPRs.forEach((repo) => {
    const markdown = generateMarkdown(repo.prList);
    markdownContent += `\n## ${repo.repo.toUpperCase()}\n\n` + markdown;
  });
  const reportFilename = `./reports/merged-prs/${YEAR}-${dates.twoDigitMonth}.md`;
  await writeMarkdownFile(reportFilename, markdownContent);

  console.log('-------------------------------------------------\n');
  console.log(` ⚠️  NO MERGED PRS FOUND ⚠️`);
  console.table(reposWithNoPRs);
}

main();
