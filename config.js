exports.config = {
  GITHUB_PR_API_URL: 'https://api.github.com/repos/{owner}/{repo}/pulls',
  GITHUB_RELEASE_API_URL:
    'https://api.github.com/repos/{owner}/{repo}/releases',
  GITHUB_ISSUES_API_URL: 'https://api.github.com/repos/{owner}/{repo}/issues',
  HEADERS: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  }
};
