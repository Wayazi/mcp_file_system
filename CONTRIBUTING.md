# Contributing to MCP Filesystem Server

We love your input! We want to make contributing to this MCP server as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Run tests:
   ```bash
   npm test
   ```

## Testing

We use Jest for testing. Please ensure all tests pass before submitting a PR:

```bash
npm test
```

Add new tests for any new features or bug fixes.

## Docker Development

To build and run the Docker container locally:

```bash
# Build container
npm run docker:build

# Run container with a mounted directory
npm run docker:run
```

## Security

Security is a top priority. When developing:

- Always validate file paths
- Never allow directory traversal
- Handle file permissions carefully
- Sanitize all inputs

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with your changes
3. The PR will be merged once you have the sign-off of a maintainer

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project.

## Report bugs using GitHub's [issue tracker](https://github.com/mcptools/filesystem/issues)
We use GitHub issues to track public bugs.