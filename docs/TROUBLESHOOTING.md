# Troubleshooting Guide

This guide helps resolve common issues when using the MCP Filesystem Server.

## Common Issues

### 1. Access Denied Errors

**Problem:** `Access denied: /path/to/file is not within allowed directories`

**Cause:** The file path is outside the directories specified when starting the server.

**Solutions:**
- Ensure the file path is within one of the allowed directories
- Start the server with the correct allowed directories
- Use absolute paths for clarity

```bash
# Correct: Start server with allowed directory
node dist/index.js /home/user/projects

# Then access files within that directory
/home/user/projects/file.txt  ✓
/home/user/documents/file.txt  ✗
```

### 2. File Size Errors

**Problem:** `File size exceeds limit of 10485760 bytes` or `Content size exceeds limit`

**Cause:** File or content exceeds the configured size limit (10MB by default).

**Solutions:**
- Check file size before operations
- Increase the size limit in configuration if needed
- Use streaming for large files (not currently supported)

```typescript
// Check file size first
const stats = await fs.stat(filePath);
if (stats.size > 10 * 1024 * 1024) {
    console.log('File is too large');
}
```

### 3. File Type Restrictions

**Problem:** `File type not allowed: .exe`

**Cause:** File extension is not in the allowed types list.

**Solutions:**
- Use allowed file types (see configuration)
- Modify the `allowedFileTypes` configuration
- Use a different file extension

```typescript
// Current allowed types
const allowedFileTypes = new Set([
    '.txt', '.md', '.json', '.js', '.ts', 
    '.html', '.css', '.py'
]);
```

### 4. Permission Errors

**Problem:** `EACCES: permission denied` or `EPERM: operation not permitted`

**Cause:** Insufficient filesystem permissions.

**Solutions:**
- Check file/directory permissions
- Ensure the user running the server has appropriate access
- For Docker: check volume mount permissions

```bash
# Check permissions
ls -la /path/to/file

# Fix permissions if needed
chmod 644 /path/to/file  # For files
chmod 755 /path/to/dir   # For directories
```

### 5. Docker Volume Issues

**Problem:** Files not accessible in Docker container

**Cause:** Volume not properly mounted or permission issues.

**Solutions:**
- Verify volume mount syntax
- Check file ownership and permissions
- Use absolute paths for volume mounts

```bash
# Correct volume mounting
docker run -v /host/path:/projects mcptools/filesystem

# Check mounted volume
docker exec -it container ls -la /projects
```

### 6. Path Resolution Issues

**Problem:** Files not found despite correct paths

**Cause:** Relative vs absolute path confusion.

**Solutions:**
- Always use absolute paths
- Verify current working directory
- Check for symlinks

```typescript
const path = require('path');

// Convert to absolute path
const absolutePath = path.resolve(relativePath);
```

## Debugging Tips

### 1. Enable Verbose Logging

The server outputs audit logs when `CONFIG.auditLog` is enabled:

```typescript
// Enable in configuration
const CONFIG = {
    auditLog: true,
    // ... other config
};
```

Log format:
```json
{
    "timestamp": "2025-01-XX...",
    "operation": "read_file",
    "path": "/projects/file.txt",
    "success": true,
    "error": null
}
```

### 2. Test Server Connectivity

Check if the server is running and responsive:

```bash
# Check if server process is running
ps aux | grep node

# For Docker: check container status
docker ps
docker logs container_name
```

### 3. Validate Configuration

Verify server configuration and allowed directories:

```typescript
// Use the list_allowed_directories tool
const result = await client.callTool('list_allowed_directories', {});
console.log('Allowed directories:', result.content[0].text);
```

### 4. Test File Operations

Start with simple operations to verify functionality:

```typescript
// Test basic connectivity
try {
    const result = await client.callTool('list_allowed_directories', {});
    console.log('Server is working:', result);
} catch (error) {
    console.error('Server connection failed:', error);
}

// Test file access
try {
    const result = await client.callTool('list_directory', {
        path: '/projects'
    });
    console.log('Directory accessible:', result);
} catch (error) {
    console.error('Directory access failed:', error);
}
```

## Performance Issues

### 1. Slow File Operations

**Causes:**
- Large files exceeding reasonable sizes
- Network latency (if running remotely)
- Disk I/O bottlenecks

**Solutions:**
- Check file sizes before operations
- Use SSD storage for better performance
- Monitor system resources

### 2. Memory Usage

**Causes:**
- Large files loaded into memory
- Multiple concurrent operations

**Solutions:**
- Monitor memory usage
- Limit concurrent operations
- Consider file size limits

```bash
# Monitor memory usage
top -p $(pgrep node)
```

## Error Recovery

### 1. Corrupted Operations

If an operation fails midway:

1. Check the audit logs for details
2. Verify file system state
3. Retry the operation if safe
4. Use file system checks if needed

### 2. Lock Files

If files appear locked:

1. Check for running processes using the file
2. Restart the server if necessary
3. Check file permissions

```bash
# Find processes using a file
lsof /path/to/file

# Kill process if necessary
kill -9 <pid>
```

## Getting Help

### 1. Check Logs

Always check the server logs first:
- Console output for audit logs
- Docker logs if using containers
- System logs for permission issues

### 2. Verify Environment

- Node.js version compatibility
- File system permissions
- Available disk space
- Network connectivity (if applicable)

### 3. Test with Minimal Setup

Create a minimal test case:

```bash
# Create test directory
mkdir /tmp/mcp-test
echo "test content" > /tmp/mcp-test/test.txt

# Start server with test directory
node dist/index.js /tmp/mcp-test

# Test basic operation
# (from your MCP client)
```

### 4. Contact Support

When reporting issues, include:
- Server version and configuration
- Complete error messages
- Steps to reproduce
- Environment details (OS, Docker version, etc.)
- Relevant log entries

## Prevention Tips

1. **Regular Testing**: Test file operations in development
2. **Monitor Resources**: Watch disk space and memory usage
3. **Backup Important Data**: Before running delete operations
4. **Use Version Control**: For code files, use git for safety
5. **Validate Inputs**: Check paths and content before operations
6. **Review Permissions**: Ensure proper file system permissions
7. **Update Regularly**: Keep the server and dependencies updated