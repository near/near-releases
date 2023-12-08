const {
  getDates,
  getReleases,
  generateMarkdownTable,
  writeMarkdownFile,
  markdownToHtml,
  sendEmail,
} = require('../utils');
const { repos } = require('../data/repos');
const dates = getDates(process.argv[2], process.argv[3]);

async function main() {
  console.log('\n -> L👀king for releases for the following repositories:\n');
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
        const release_date = fetchedReleases[0].published_at.split('T')[0];
        const release = `[${fetchedReleases[0].name}](${fetchedReleases[0].html_url})`;
        releases.push({ repo, release, release_date});
      } else {
        reposWithNoReleases.push(repo);
      }
      process.stdout.write(` ✅ - ${repo}`);
    } catch (error) {
      console.error(`⛔️ - Error fetching ${owner}/${repo}: ${error.message}`);
    }
  }
  console.log('\n 👍 All repositories checked \n');
 
  const markdown = generateMarkdownTable(releases, dates.markdownDate);
  const emailTxt = markdownToHtml(markdown);
  const reportFilename = `./reports/releases/${process.argv[3]}-${dates.twoDigitMonth}.md`;

  try {
    await writeMarkdownFile(reportFilename, markdown);
    const title = `🎉 NEAR Releases for ${dates.monthSpelled} ${process.argv[3]}`;
    if (process.argv[4]) {
      console.log(' 📫  Sending email... ');
      await sendEmail(title, emailTxt);
    }
  } catch (err) {
    console.log('ERROR: ', err);
  }

  console.log('-------------------------------------------------\n\n');
  console.log(
    ` 🎉 - ${dates.markdownDate.monthSpelled} ${process.argv[3]} New Releases:`
  );
  console.table(releases);
}
main();
