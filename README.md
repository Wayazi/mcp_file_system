# MCP Filesystem Server

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

The server implements path validation to ensure operations only occur within allowed directories specified at startup.

## License

ISC