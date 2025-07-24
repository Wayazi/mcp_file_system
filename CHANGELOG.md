# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - d3v branch

### Added
- Improved CI/CD workflow with d3v branch integration
- Separate Docker image tagging for development and production
- Automated testing for both d3v and main branches

## [1.1.0] - 2025-01-XX - Major Feature Update

### Added
- **New File Operations**:
  - `copy_file` - Copy files with validation and error handling
  - `delete_file` - Safe file deletion with type checking
  - `delete_directory` - Directory deletion with optional recursive mode
- **Enhanced Security Features**:
  - File type restrictions with configurable whitelist
  - File size validation (10MB default limit)
  - Content size validation for write operations
  - Comprehensive audit logging for all operations
- **Developer Experience**:
  - ESLint configuration for code quality
  - Prettier configuration for consistent formatting
  - Enhanced error messages with detailed context
  - Lint and format npm scripts
- **Documentation**:
  - Comprehensive troubleshooting guide
  - Enhanced README with usage examples
  - Updated API documentation with new tools
  - Security best practices guide

### Enhanced
- **Input Validation**: 
  - Enhanced path validation with better error messages
  - File operation validation with type checking
  - Content validation for write operations
- **Error Handling**:
  - Standardized error response format
  - Detailed error messages for debugging
  - Audit logging for failed operations
- **Testing**:
  - Added tests for all new file operations
  - Enhanced test coverage for edge cases
  - Improved test isolation and cleanup
- **Security**:
  - Configurable file type restrictions
  - Resource limits and validation
  - Audit trail for all operations

### Fixed
- Improved error handling consistency across all tools
- Better validation for file vs directory operations
- Enhanced path resolution and validation

### Technical Improvements
- Added configuration object for better customization
- Separated validation logic into dedicated functions
- Enhanced audit logging with structured JSON format
- Better type safety with improved TypeScript usage

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