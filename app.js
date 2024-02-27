const {
  writeMarkdownFile,
  formatDates,
  markdownToHtml,
  sendEmail,
} = require('./utils');
const { createMergedPrReport } = require('./scripts/fetch-merged-prs');
const { createReleaseReport } = require('./scripts/fetch-releases');
const { repos } = require('./data/repos');

const dates = formatDates(1, 2024);

function getUniqueTypes() {
  const types = new Set();
  for (const repo of repos) {
    types.add(repo.type);
  }
  return Array.from(types);
}

async function main() {
  let markdown = `# ${dates.monthSpelled} 2023\n\nDeveloper changelog for [essential repositories](https://near.dev) when building on NEAR Protocol. 🏗️\n\n`;
  markdown += '👉 [Get monthly emails of this report](https://docs.google.com/forms/d/1JfFUbTq3ELUlScJT1UI9PQPuQsv0W2jcTa7P94KrS5U/edit) 👈\n\n'

  const types = getUniqueTypes(repos);

  markdown += await createReleaseReport(repos, dates);
  console.log('\n -> L👀king for MERGED PRs for the following repositories:\n');
  markdown += `\n---\n\n## Merged Pull Requests  🚀\n`;

  for (const type of types) {
    const filteredRepos = repos.filter((repo) => repo.type === type);
    const data = await createMergedPrReport(filteredRepos, dates);
    if (data && data.length > 0) {
      markdown += `\n## ${type}\n${data}`;
    }
  }
  console.log('\n 👍 All repositories checked \n');
  writeMarkdownFile(`./reports/${dates.markdownDate}-changelog.md`, markdown);
  // const emailTxt = markdownToHtml(markdown);
  // const title = `Developer Changelog for ${dates.monthSpelled} 2023`;
  // console.log('\n 📫 Sending email \n');
  // await sendEmail(title, emailTxt);
}

main();
