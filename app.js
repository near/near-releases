const { writeMarkdownFile, formatDates } = require('./utils');
const { createMergedPrReport } = require('./scripts/fetch-merged-prs');
const { createReleaseReport } = require('./scripts/fetch-releases');
const { repos } = require('./data/repos');

const dates = formatDates(8, 2023);

function getUniqueTypes() {
  const types = new Set();
  for (const repo of repos) {
    types.add(repo.type);
  }
  return Array.from(types);
}

async function main() {
  let markdown = `# ${dates.monthSpelled} 2023\n\n  Developer changelog for [essential repositories](/develop/github-overview) when building on NEAR Protocol. 🏗️\n\n`;

  const types = getUniqueTypes(repos);

  markdown += await createReleaseReport(repos, dates);
  markdown += `\n## Merged Pull Requests  🚀\n`;

  for (const type of types) {
    const filteredRepos = repos.filter((repo) => repo.type === type);
    const data = await createMergedPrReport(filteredRepos, dates);
    if (data && data.length > 0) {
      markdown += `\n## ${type}\n${data}`;
    }
  }
  writeMarkdownFile(`./reports/${dates.markdownDate}-changelog.md`, markdown);
}

main();
