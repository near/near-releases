const { getReleases, generateMarkdownTable } = require('../utils');

async function createReleaseReport(repos, dates) {
  console.log('\n -> L👀king for RELEASES for the following repositories:\n');
  let releases = [];
  let reposWithNoReleases = [];

  for (const { owner, repo, description } of repos) {
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
        releases.push({ repo, release, description,});
      } else {
        reposWithNoReleases.push(repo);
      }
      process.stdout.write(` ✅ - ${repo} \n`);
    } catch (error) {
      console.error(`⛔️ - Error fetching ${owner}/${repo}: ${error.message}`);
    }
  }
  console.log('\n 👍 All repositories checked \n');

  let markdown = `## Releases  🎉\n\n`;

  markdown += generateMarkdownTable(releases);
  return markdown;
}

module.exports = { createReleaseReport };
