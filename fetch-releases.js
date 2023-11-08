const {
  generateMarkdown,
  writeMarkdownFile,
  getReleases,
  getDates,
  generateMarkdownTable,
} = require('./utils');
const repos = require('./data/repos').repos;
const { config } = require('./config');
const dates = getDates(config.month, config.year);

async function main() {
  console.log('\n Fetching releases for the following repositories:\n');
  let releases = [];
  let reposWithNoReleases = [];

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
        reposWithNoReleases.push(repo);
      }
    } catch (error) {
      console.error(`⛔️ - Error fetching ${owner}/${repo}: ${error.message}`);
    }
    console.log(` ✅ - ${repo} `);
  }
  console.log('\n 👍 All repositories checked \n');

  const markdown = generateMarkdownTable(releases, dates.markdownDate);
  const reportFilename = `./reports/releases/${config.year}-${dates.twoDigitMonth}.md`;
  await writeMarkdownFile(reportFilename, markdown);
  console.log('-------------------------------------------------\n\n');
  console.log(` 🎉 - ${dates.monthSpelled} ${config.year} New Releases:`);
  console.table(releases);
}

main();
