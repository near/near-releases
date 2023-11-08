import inquirer from 'inquirer';
import { spawn } from 'child_process';

const scripts = [
  { name: 'Fetch Releases', value: './scripts/fetch-releases.js' },
  { name: 'Fetch Merged PRs', value: './scripts/fetch-merged-prs.js' },
];

inquirer
  .prompt([
    {
      type: 'list',
      name: 'script',
      message: 'Which file do you want to run?',
      choices: scripts,
    },
  ])
  .then((answers) => {
    const child = spawn('node', [answers.script]);

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
      console.log(`Child process exited with code ${code}`);
    });
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });
