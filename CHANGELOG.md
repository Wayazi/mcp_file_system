# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - d3v branch

### Added
- Improved CI/CD workflow with d3v branch integration
- Separate Docker image tagging for development and production
- Automated testing for both d3v and main branches

## [1.0.1] - 2025-04-06

### Added
- Comprehensive test suite for all filesystem operations
- Jest configuration for ES modules and TypeScript
- Type-safe MCP tool handler testing
- Proper test isolation using temporary directories
- Detailed testing documentation

### Fixed
- ES modules compatibility in test environment
- Type safety in MCP tool responses
- Test cleanup and isolation
- Jest configuration for TypeScript

## [1.0.0] - 2025-04-06

### Added
- Initial release of the filesystem MCP server
- File operations: read, write, move
- Directory operations: create, list
- File search functionality with pattern matching
- File metadata retrieval
- Security features with path validation
- Docker container support with non-root user
- Comprehensive test suite
- TypeScript support with full type safety