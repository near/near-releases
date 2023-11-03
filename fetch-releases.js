const {
  generateMarkdown,
  writeMarkdownFile,
  getLatestReleases,
} = require('./utils');
const repos = require('./repos').repos;

async function main() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const formattedDate = oneMonthAgo.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  let releases = [];
  let noReleases = [];

  for (const { owner, repo } of repos) {
    try {
      const latestReleaseDate = await getLatestReleases(owner, repo);
      if (latestReleaseDate && latestReleaseDate > oneMonthAgo) {
        // const link = release[0].html_url;
        releases.push({ owner, repo });
      } else {
        noReleases.push(repo);
      }
    } catch (error) {
      console.error(`⛔️ - Error fetching ${owner}/${repo}: ${error.message}`);
    }
    console.log(`✅ - ${repo} `);
  }
  console.log('\n');
  const markdown = generateMarkdown(releases, formattedDate);
  const reportFilename = `./reports/releases/${formattedDate}.md`;
  await writeMarkdownFile(reportFilename, markdown);

  console.log('🎉 - New releases in the past month for:');
  console.table(releases);
  console.log('🙅 - No new releases in the past month for:');
  console.table(noReleases);
}

main();
