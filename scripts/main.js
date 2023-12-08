const { writeMarkdownFile, getDates } = require('../utils');
const { createMergedPrReport } = require('./fetch-merged-prs');
const { createReleaseReport } = require('./fetch-releases');

const dates = getDates(11, 2023);

async function main() {

    const releaseReport = await createReleaseReport(dates);
    const mergedPrReport = await createMergedPrReport(dates);
    const markdown =  releaseReport + mergedPrReport;
    writeMarkdownFile('./reports/report.md', markdown);
}

main();