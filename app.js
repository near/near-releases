const { writeMarkdownFile, formatDates } = require('./utils');
const { createMergedPrReport } = require('./scripts/fetch-merged-prs');
const { createReleaseReport } = require('./scripts/fetch-releases');
const { repos } = require('./data/repos');

const dates = formatDates(8, 2023);

async function main() {
  let markdown = `# ${dates.monthSpelled} 2023\n\n`;
  markdown += await createReleaseReport(repos, dates);
  markdown += await createMergedPrReport(repos, dates);
  writeMarkdownFile(`./reports/${dates.markdownDate}-releases.md`, markdown);
}

main();
