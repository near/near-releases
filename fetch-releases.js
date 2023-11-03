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
      const fetchedReleases = await getLatestReleases(owner, repo);
      let latestReleaseDate = null;
      fetchedReleases ? latestReleaseDate = new Date(fetchedReleases[0].published_at) : null;
      if (latestReleaseDate && latestReleaseDate > oneMonthAgo) {
        const release_url = fetchedReleases[0].html_url;
        const tag_name = fetchedReleases[0].tag_name;
        releases.push({ repo, tag_name , release_url });
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
