# MCP Filesystem Server API Documentation

This document details all available tools in the MCP Filesystem Server.

## Tools Overview

All tools follow standard MCP response format, returning content in the following structure:
```typescript
{
  content: [{ type: 'text', text: string }]
}
```

### read_file

Reads the contents of a file.

**Parameters:**
- `path` (string): Path to the file to read

**Returns:**
- Success: File contents
- Error: Error message with details

**Example:**
```typescript
const result = await client.callTool('read_file', {
  path: '/path/to/file.txt'
});
```

### read_multiple_files

Reads multiple files simultaneously.

**Parameters:**
- `paths` (string[]): Array of file paths to read

**Returns:**
- Success: Combined contents of all files
- Error: Individual error messages for failed reads

### write_file

Creates a new file or overwrites an existing one.

**Parameters:**
- `path` (string): File location
- `content` (string): Content to write

**Returns:**
- Success: Confirmation message
- Error: Error message with details

### create_directory

Creates a new directory.

**Parameters:**
- `path` (string): Directory path to create

**Returns:**
- Success: Confirmation message
- Error: Error message with details

**Notes:**
- Creates parent directories if they don't exist
- No error if directory already exists

### list_directory

Lists contents of a directory with file types.

**Parameters:**
- `path` (string): Directory path to list

**Returns:**
- Success: List of entries with [FILE] or [DIR] prefix
- Error: Error message with details

### move_file

Moves or renames files and directories.

**Parameters:**
- `source` (string): Source path
- `destination` (string): Destination path

**Returns:**
- Success: Confirmation message
- Error: Error message if destination exists or other issues

**Notes:**
- Fails if destination already exists
- Works for both files and directories

### get_file_info

Retrieves detailed metadata about a file or directory.

**Parameters:**
- `path` (string): Path to file or directory

**Returns:**
- Success: JSON object with:
  - type: 'file' or 'directory'
  - size: in bytes
  - created: creation timestamp
  - modified: last modified timestamp
  - accessed: last accessed timestamp
  - permissions: octal string
- Error: Error message with details

### search_files

Recursively searches for files matching a pattern.

**Parameters:**
- `path` (string): Starting directory
- `pattern` (string): Search pattern
- `excludePatterns` (string[], optional): Patterns to exclude

**Returns:**
- Success: List of matching file paths
- Error: Error message with details

**Notes:**
- Case-insensitive search
- Searches recursively through subdirectories
- Can exclude paths matching specific patterns

## Security Considerations

1. Path Validation
   - All paths are validated against allowed directories
   - No access outside allowed directories
   - No symbolic link traversal

2. Error Handling
   - Detailed error messages for troubleshooting
   - No sensitive information exposure
   - Graceful failure handling

3. Permissions
   - Respects file system permissions
   - Operations run as container user
   - Read-only access by default

## Best Practices

1. Always validate paths before use
2. Use absolute paths when possible
3. Handle errors appropriately
4. Clean up resources after use
5. Avoid large file operations
6. Use appropriate encoding (UTF-8)