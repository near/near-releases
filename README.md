# Release and Merged Pull Request Aggregator

- Query many repositories
- Generate markdown reports
- Email results

## Requirements

- [Node.js](https://nodejs.org)
- [Github API Token](https://github.com/settings/tokens)

## Setup

1) Install dependencies

```bash
npm i  
```

2) Create an `.env` file and add your [Github API Token](https://github.com/settings/tokens)

```bash
GITHUB_TOKEN='YOUR_GITHUB_API_TOKEN'
```

3) Add repositories to `./data/repos.js`

```bash
exports.repos = [
  { owner: 'octocat', repo: 'Hello-World' },
  { owner: 'vercel', repo: 'next.js' },
];

```

## Run

```bash
node app.mjs
```
