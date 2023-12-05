require('dotenv').config();
const {
  getDates,
  getMergedPRs,
  writeMarkdownFile,
  generatePRsMarkdownDoc,
  formatPRs,
  countPRs,
  createTransporter
} = require('../utils');
const repos = require('../data/test/test-repos').repos;
const { marked } = require('marked');
const dates = getDates(10, 2023);

async function main() {
  console.log(
    '\n -> L👀king for merged pull requests for the following repositories:\n'
  );

  let reposWithPRs = [];
  let reposWithNoPRs = [];

  for (const { owner, repo } of repos) {
    try {
      const PRs = await getMergedPRs(
        owner,
        repo,
        dates.startDate,
        dates.endDate
      );
      if (PRs.length > 0) {
        const prList = formatPRs(PRs);
        reposWithPRs.push({ repo, prList });
      } else reposWithNoPRs.push({ repo });
    } catch (error) {
      console.error(`⛔️ - Error checking ${owner}/${repo}: ${error.message}`);
    }
  }
  console.log('\n 👍 All repositories checked \n');

  const totalPRs = countPRs(reposWithPRs);
  const markdownContent = generatePRsMarkdownDoc(reposWithPRs, dates);
  const reportFilename = `./reports/merged-prs/${process.argv[3]}-${dates.twoDigitMonth}.md`;
  const renderer = new marked.Renderer();

renderer.heading = function (text, level) {
  // Create a slug from the header text
  const slug = text.toLowerCase().replace(/[\s]+/g, '-').replace(/[^\w\-]+/g, '');
  return `<h${level} id="${slug}">${text}</h${level}>`;
};
  let emailTxt = marked.parse(markdownContent, { renderer: renderer });
  emailTxt = emailTxt.replace(/<table>/g, '<table border="1" cellpadding="10" cellspacing="5" style="border-collapse: collapse;">');
  console.log(emailTxt)
  try {
    
    const mailOptions = {
      from: process.env.EMAIL,
      to: 'josh@near.org',
      subject: `🚀 NEAR Merged PRs for ${dates.markdownDate.monthSpelled} ${dates.markdownDate.year}`,
      html: emailTxt,
    };
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(mailOptions);
  } catch (err) {
    console.log('ERROR: ', err);
  }


  console.log('-------------------------------------------------\n');
  console.log(
    ` 🚀 ${totalPRs} merged PRs found for ${dates.monthSpelled} ${process.argv[3]}\n`
  );

  await writeMarkdownFile(reportFilename, markdownContent);

  console.log('-------------------------------------------------\n');
  console.log(` ❌ NO MERGED PRS FOUND FOR THE FOLLOWING REPOS:`);
  console.table(reposWithNoPRs);
}

main();
