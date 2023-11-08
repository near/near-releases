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
    {
      type: 'input',
      name: 'month',
      message: 'Enter the month (as a number from 1 to 12):',
      validate: (input) => {
        const parsed = parseInt(input, 10);
        return parsed >= 1 && parsed <= 12
          ? true
          : 'Please enter a valid month number (1-12).';
      },
    },
    {
      type: 'input',
      name: 'year',
      message: 'Enter the year:',
      validate: (input) => {
        const parsed = parseInt(input, 10);
        return parsed && parsed > 2000 && parsed < 3000
          ? true
          : 'Please enter a valid year (greater than 2000).';
      },
    },
  ])
  .then((answers) => {
    const child = spawn('node', [answers.script, answers.month, answers.year]);

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
