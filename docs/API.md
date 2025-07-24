# MCP Filesystem Server API Documentation

This document details all available tools in the MCP Filesystem Server, verified through comprehensive testing.

## Tools Overview

All tools follow standard MCP response format with type-safe responses:
```typescript
{
  content: [{ type: 'text', text: string }]
}
```

## Core File Operations

### read_file

Reads the contents of a file with size validation and audit logging.

**Parameters:**
- `path` (string): Path to the file to read, must be within allowed directories

**Returns:**
- Success: File contents as text
- Error: Error message with details

**Security Features:**
- File size validation (10MB limit by default)
- Path validation against allowed directories
- Audit logging of all read operations

**Example:**
```typescript
const result = await client.callTool('read_file', {
  path: '/projects/example.txt'
});
// result.content[0].text contains the file contents
```

### write_file

Creates or overwrites a file with provided content. Includes content validation and audit logging.

**Parameters:**
- `path` (string): Target file path within allowed directories
- `content` (string): Content to write

**Returns:**
- Success: Confirmation message with path
- Error: Detailed error for permissions, path issues, or content validation

**Security Features:**
- Content size validation (10MB limit by default)
- File type validation (configurable whitelist)
- Path validation against allowed directories
- Audit logging of all write operations

**Example:**
```typescript
await client.callTool('write_file', {
  path: '/projects/new-file.txt',
  content: 'Hello, World!'
});
```

### copy_file

Copies a file from source to destination with validation checks.

**Parameters:**
- `source` (string): Source file path
- `destination` (string): Destination file path

**Returns:**
- Success: Operation confirmation with paths
- Error: Detailed error for conflicts, permissions, or validation issues

**Security Features:**
- Validates source is a file (not directory)
- Prevents overwriting existing files
- Path validation for both source and destination
- Audit logging of copy operations

**Example:**
```typescript
await client.callTool('copy_file', {
  source: '/projects/template.txt',
  destination: '/projects/copy.txt'
});
```

### delete_file

Safely deletes a file with validation and audit logging.

**Parameters:**
- `path` (string): File path to delete

**Returns:**
- Success: Deletion confirmation
- Error: Detailed error for permissions or validation issues

**Security Features:**
- Validates target is a file (not directory)
- Path validation against allowed directories
- Audit logging of all delete operations

**Example:**
```typescript
await client.callTool('delete_file', {
  path: '/projects/old-file.txt'
});
```

## Directory Operations

### create_directory

Creates a directory with recursive option for nested paths.

**Parameters:**
- `path` (string): Directory path to create

**Returns:**
- Success: Creation confirmation
- Error: Detailed error for permissions or path issues

**Example:**
```typescript
await client.callTool('create_directory', {
  path: '/projects/new-folder'
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

### delete_directory

Safely deletes directories with optional recursive deletion.

**Parameters:**
- `path` (string): Directory path to delete
- `recursive` (boolean, optional): Delete recursively (dangerous!)

**Returns:**
- Success: Deletion confirmation
- Error: Detailed error for permissions or validation issues

**Security Features:**
- Validates target is a directory (not file)
- Path validation against allowed directories
- Audit logging of all delete operations
- Optional recursive deletion with safety warnings

**Example:**
```typescript
// Delete empty directory
await client.callTool('delete_directory', {
  path: '/projects/empty-folder'
});

// Delete directory recursively (use with caution!)
await client.callTool('delete_directory', {
  path: '/projects/folder-with-contents',
  recursive: true
});
```

## File Management Operations

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

Searches for files by pattern with exclusion support.

**Parameters:**
- `path` (string): Base directory for search
- `pattern` (string): Case-insensitive search pattern
- `excludePatterns` (string[], optional): Patterns to exclude

**Returns:**
- Success: Newline-separated list of matching files
- Error: Search execution error details

**Example:**
```typescript
const result = await client.callTool('search_files', {
  path: '/projects',
  pattern: '.txt',
  excludePatterns: ['node_modules', 'dist']
});
// result.content[0].text contains matching files
```

### get_file_info

Retrieves detailed metadata about files or directories.

**Parameters:**
- `path` (string): Path to file or directory

**Returns:**
- Success: JSON object with file metadata (type, size, dates, permissions)
- Error: Access or path error details

**Example:**
```typescript
const result = await client.callTool('get_file_info', {
  path: '/projects/example.txt'
});
// result.content[0].text contains JSON metadata
```

## Utility Operations

### read_multiple_files

Reads multiple files in a single operation with parallel processing.

**Parameters:**
- `paths` (string[]): Array of file paths to read

**Returns:**
- Success: Combined results for all files
- Error: Individual errors for each failed file

**Example:**
```typescript
const result = await client.callTool('read_multiple_files', {
  paths: ['/projects/file1.txt', '/projects/file2.txt']
});
```

### list_allowed_directories

Lists all directories that the server has access to.

**Parameters:** None

**Returns:**
- Success: List of allowed directories
- Error: Server configuration error

**Example:**
```typescript
const result = await client.callTool('list_allowed_directories', {});
// Shows all accessible directories
```

## Security and Configuration

### Security Features

1. **Path Validation**
   - Every operation validates paths against allowed directories
   - Tests verify no access outside allowed boundaries
   - Symlink resolution prevents traversal attacks

2. **File Type Restrictions**
   - Configurable whitelist of allowed file extensions
   - Prevents execution of dangerous file types
   - Applied during write and create operations

3. **Resource Limits**
   - File size limits (10MB default, configurable)
   - Content size validation for write operations
   - Directory depth limits for recursive operations

4. **Audit Logging**
   - All operations logged with timestamps
   - Success/failure status tracking
   - JSON format for easy parsing
   - Configurable enable/disable

5. **Error Handling**
   - All operations have error test coverage
   - Clear, actionable error messages
   - No information leakage in errors

### Configuration Options

```typescript
const CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    maxDirectoryDepth: 10, // Maximum depth for recursive operations
    allowedFileTypes: new Set(['.txt', '.md', '.json', '.js', '.ts', '.html', '.css', '.py']),
    auditLog: true, // Enable audit logging
};
```

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

1. **Security**
   - Mount project directories read-only when possible
   - Use absolute paths for clarity
   - Stay within allowed directories
   - Monitor audit logs regularly

2. **Error Handling**
   - Handle errors in your client code
   - Check file existence before operations
   - Validate paths on client side when possible

3. **Performance**
   - Use `read_multiple_files` for batch operations
   - Limit search patterns to reduce processing time
   - Monitor file sizes before operations

4. **Testing**
   - Follow the testing patterns for extensions
   - Test error conditions as well as success cases
   - Use temporary directories for test isolation

## Recent Improvements

- Added comprehensive input validation and security features
- Implemented audit logging for all operations
- Added file type restrictions and size limits
- Enhanced error handling with detailed messages
- Added new operations: copy_file, delete_file, delete_directory
- Improved test coverage with additional test cases
- Added configuration options for customization