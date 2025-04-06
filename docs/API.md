# MCP Filesystem Server API Documentation

This document details all available tools in the MCP Filesystem Server, verified through comprehensive testing.

## Tools Overview

All tools follow standard MCP response format with type-safe responses:
```typescript
{
  content: [{ type: 'text', text: string }]
}
```

### read_file

Reads the contents of a file. Tested with various file sizes and encodings.

**Parameters:**
- `path` (string): Path to the file to read, must be within allowed directories

**Returns:**
- Success: File contents as text
- Error: Error message with details

**Example:**
```typescript
const result = await client.callTool('read_file', {
  path: '/projects/example.txt'
});
// result.content[0].text contains the file contents
```

### write_file

Creates or overwrites a file with provided content. Tests verify atomic write operations.

**Parameters:**
- `path` (string): Target file path within allowed directories
- `content` (string): Content to write

**Returns:**
- Success: Confirmation message with path
- Error: Detailed error for permissions or path issues

**Example:**
```typescript
await client.callTool('write_file', {
  path: '/projects/new-file.txt',
  content: 'Hello, World!'
});
```

### list_directory

Lists directory contents with type information. Tests verify correct file type detection.

**Parameters:**
- `path` (string): Directory to list

**Returns:**
- Success: List of entries with [FILE] or [DIR] prefix
- Error: Access or path error details

**Example:**
```typescript
const result = await client.callTool('list_directory', {
  path: '/projects'
});
// result.content[0].text might be:
// [FILE] example.txt
// [DIR] subfolder
```

### move_file

Moves or renames files safely. Tests verify atomicity and error handling.

**Parameters:**
- `source` (string): Source path
- `destination` (string): Destination path

**Returns:**
- Success: Operation confirmation with paths
- Error: Detailed error for conflicts or permissions

**Example:**
```typescript
await client.callTool('move_file', {
  source: '/projects/old.txt',
  destination: '/projects/new.txt'
});
```

### search_files

Searches for files by pattern. Tests verify pattern matching and performance.

**Parameters:**
- `path` (string): Base directory for search
- `pattern` (string): Case-insensitive search pattern

**Returns:**
- Success: Newline-separated list of matching files
- Error: Search execution error details

**Example:**
```typescript
const result = await client.callTool('search_files', {
  path: '/projects',
  pattern: '.txt'
});
// result.content[0].text contains matching files
```

## Security and Testing

1. **Path Validation**
   - Every operation validates paths against allowed directories
   - Tests verify no access outside allowed boundaries
   - Symlink resolution prevents traversal attacks

2. **Error Handling**
   - All operations have error test coverage
   - Clear, actionable error messages
   - No information leakage in errors

3. **Performance**
   - Async operations for large files
   - Batched operations where appropriate
   - Resource cleanup verified by tests

## Docker Integration

The server runs in a Docker container with:
- Non-root user execution
- Volume mounting for project access
- Health monitoring
- Resource limits

### Docker Usage
```bash
# Using docker-compose
PROJECTS_DIR=/path/to/projects docker-compose up

# Direct docker run
docker run -v /path/to/projects:/projects mcptools/filesystem
```

## Best Practices

1. Mount project directories read-only when possible
2. Use absolute paths for clarity
3. Handle errors in your client code
4. Monitor container health
5. Stay within allowed directories
6. Follow the testing patterns for extensions