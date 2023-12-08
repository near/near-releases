const { writeMarkdownFile, getDates } = require('../utils');
const { createMergedPrReport } = require('./fetch-merged-prs');
const { createReleaseReport } = require('./fetch-releases');

const dates = getDates(11, 2023);

async function main() {

    let markdown = `# NEAR Releases for ${dates.monthSpelled} 2023 \n`
    markdown += await createReleaseReport(dates);
    markdown += await createMergedPrReport(dates);
    writeMarkdownFile('./reports/report.md', markdown);
}

main();