require('dotenv').config();
const {
  getDates,
  getMergedPRs,
  generateMarkdown,
  writeMarkdownFile,
} = require('./utils');
const repos = require('./test-repos').repos;

const MONTH = 10;
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
        let prList = [];
        PRs.forEach((pr) => {
          pr.merged_at = pr.merged_at.split('T')[0];
          if (pr.title.length > 40) {
            pr.title = pr.title.substring(0, 50) + '...';
          }
          prList.push({
            title: pr.title,
            merged_at: pr.merged_at,
            html_url: pr.html_url,
          });
          return;
        });
        reposWithPRs.push({ repo, prList });
      } else reposWithNoPRs.push({ repo });
    } catch (error) {
      console.error(`⛔️ - Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
  const totalPRs = reposWithPRs.reduce((acc, repo) => {
    acc += repo.prList.length;
    return acc;
  }, 0);

  let markdownContent = `# NEAR Merged Pull Requests for ${dates.markdownDate.monthSpelled} ${dates.markdownDate.year}\n`;

  // Generate Table of Contents
  markdownContent += `## Table of Contents\n`;
  reposWithPRs.forEach((repo) => {
    markdownContent += `- [${repo.repo.toUpperCase()}](#${repo.repo.toLowerCase()})\n`;
  });
  reposWithPRs.forEach((repo) => {
    console.log(repo.repo);
    console.table(repo.prList, ['title', 'merged_at', 'html_url']);
    const markdown = generateMarkdown(repo.prList);
    markdownContent += `\n## ${repo.repo.toUpperCase()}\n\n` + markdown;
  });
  const reportFilename = `./reports/merged-prs/${YEAR}-${dates.twoDigitMonth}.md`;
  await writeMarkdownFile(reportFilename, markdownContent);
  console.log('-------------------------------------------------\n\n');
  console.log(
    `🚀 ${totalPRs} merged PRs found for ${dates.monthSpelled} ${YEAR}:\n`
  );

  console.log('\n');
  console.log(`🙅 - No merged PRs in ${dates.monthSpelled} ${YEAR} for:`);
  console.table(reposWithNoPRs);
}

main();
