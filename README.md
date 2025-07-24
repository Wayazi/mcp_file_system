# MCP File System

A Model Context Protocol (MCP) server that provides filesystem operations through a standardized interface.

## Features

- File operations (read/write)
- Directory management (create/list/delete)
- File movement and renaming
- File metadata retrieval
- File search capabilities
- Access control through allowed directories

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server with allowed directories:
```bash
npm start /path/to/allowed/directory [/path/to/another/directory ...]
```

## Documentation

- [Server Implementation Details](docs/server-implementation-fix.md) - Learn about the server implementation and recent fixes
- See the [MCP SDK Documentation](https://modelcontextprotocol.org/docs) for more details about the protocol

## Development

The server is built using:
- TypeScript
- MCP SDK (high-level API)
- Node.js filesystem APIs

## Security

The server implements robust path validation to ensure operations only occur within allowed directories specified at startup.

### Security Features

- **Path Validation**: All file operations validate paths against allowed directories using proper directory boundary checking
- **Path Traversal Protection**: Prevents access outside allowed directories using `path.resolve()` and directory separator validation
- **Symlink Safety**: Recursive operations (like search) validate paths during traversal to prevent symlink-based escapes
- **Input Sanitization**: All user inputs are validated using Zod schemas before processing

### Security Fixes (v1.0.1)

**Critical Security Vulnerability Fixed**: The path validation function previously used a simple `startsWith()` check that could be bypassed. For example, if `/safe` was an allowed directory, an attacker could potentially access `/safe-but-dangerous`. 

**Fix**: Updated `validatePath()` to use proper directory boundary checking by ensuring paths either exactly match the allowed directory or start with the directory followed by a path separator.

**Testing**: Added comprehensive security test suite covering path traversal attempts, boundary checking, and edge cases.

## License

ISC
