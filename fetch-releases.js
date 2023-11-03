const {
  generateMarkdown,
  writeMarkdownFile,
  getReleases,
  getDates,
} = require('./utils');
const repos = require('./repos').repos;

// 0 = January, 11 = December
const MONTH = 6;
const YEAR = 2023;
const dates = getDates(MONTH, YEAR);

async function main() {
  let releases = [];
  let noReleases = [];

  for (const { owner, repo } of repos) {
    try {
      const fetchedReleases = await getReleases(
        owner,
        repo,
        dates.startDate,
        dates.endDate
      );
      if (fetchedReleases.length > 0) {
        const release_url = fetchedReleases[0].html_url;
        const release_date = fetchedReleases[0].published_at.split('T')[0];
        releases.push({ repo, release_date, release_url });
      } else {
        noReleases.push(repo);
      }
    } catch (error) {
      console.error(`⛔️ - Error fetching ${owner}/${repo}: ${error.message}`);
    }
    console.log(`✅ - ${repo} `);
  }
  console.log('\n');
  const markdown = generateMarkdown(releases, dates.markdownDate);
  const reportFilename = `./reports/releases/${YEAR}-${MONTH + 1}.md`;
  await writeMarkdownFile(reportFilename, markdown);

  console.log(`🎉 - New releases for ${dates.monthSpelled} ${YEAR}:`);
  console.table(releases);
  console.log(`🙅 - No new releases in ${dates.monthSpelled} ${YEAR} for:`);
  console.table(noReleases);
}

main();
