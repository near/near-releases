const { writeMarkdownFile, formatDates } = require('../utils');
const { createMergedPrReport } = require('./fetch-merged-prs');
const { createReleaseReport } = require('./fetch-releases');
const { repos } = require('../data/repos');

const dates = formatDates(11, 2023);

async function main() {
  let markdown = `# NEAR Releases for ${dates.monthSpelled} 2023 \n`;
  markdown += await createReleaseReport(repos, dates);
  markdown += await createMergedPrReport(repos, dates);
  writeMarkdownFile(`./reports/${dates.markdownDate}-releases.md`, markdown);
}

main();
