import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { promises as fs } from 'fs';
import * as path from 'path';
const allowedDirs = process.argv.slice(2);
if (allowedDirs.length === 0) {
    console.error('Error: No directories specified. Please provide at least one directory path.');
    process.exit(1);
}
// Validate paths are within allowed directories
function validatePath(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!allowedDirs.some(dir => absolutePath.startsWith(path.resolve(dir)))) {
        throw new Error(`Access denied: ${filePath} is not within allowed directories`);
    }
    return absolutePath;
}
// Create server instance
const server = new McpServer({
    name: "filesystem",
    version: "1.0.0",
    capabilities: {
        tools: {
            listChanged: true
        }
    }
});
// Tool: Read file contents
server.tool("read_file", { path: z.string().describe("File path to read") }, async ({ path: filePath }) => {
    try {
        const validPath = validatePath(filePath);
        const content = await fs.readFile(validPath, 'utf-8');
        return { content: [{ type: 'text', text: content }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error reading file: ${error.message}` }] };
    }
});
// Tool: Read multiple files
server.tool("read_multiple_files", { paths: z.array(z.string()).describe("Array of file paths to read") }, async ({ paths }) => {
    const results = await Promise.allSettled(paths.map(async (filePath) => {
        try {
            const validPath = validatePath(filePath);
            const content = await fs.readFile(validPath, 'utf-8');
            return { path: filePath, content, success: true };
        }
        catch (error) {
            return { path: filePath, error: error.message, success: false };
        }
    }));
    const output = results.map(result => {
        if (result.status === 'fulfilled') {
            return `${result.value.path}: ${result.value.success ?
                result.value.content : `Error: ${result.value.error}`}`;
        }
        return `Error processing file: ${result.reason}`;
    }).join('\n\n');
    return { content: [{ type: 'text', text: output }] };
});
// Tool: Write file
server.tool("write_file", { path: z.string().describe("File location"), content: z.string().describe("File content") }, async ({ path: filePath, content }) => {
    try {
        const validPath = validatePath(filePath);
        await fs.writeFile(validPath, content, 'utf-8');
        return { content: [{ type: 'text', text: `File written successfully: ${filePath}` }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error writing file: ${error.message}` }] };
    }
});
// Tool: Create directory
server.tool("create_directory", { path: z.string().describe("Directory path to create") }, async ({ path: dirPath }) => {
    try {
        const validPath = validatePath(dirPath);
        await fs.mkdir(validPath, { recursive: true });
        return { content: [{ type: 'text', text: `Directory created: ${dirPath}` }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error creating directory: ${error.message}` }] };
    }
});
// Tool: List directory
server.tool("list_directory", { path: z.string().describe("Directory path to list") }, async ({ path: dirPath }) => {
    try {
        const validPath = validatePath(dirPath);
        const entries = await fs.readdir(validPath, { withFileTypes: true });
        const listing = entries.map(entry => `[${entry.isDirectory() ? 'DIR' : 'FILE'}] ${entry.name}`).join('\n');
        return { content: [{ type: 'text', text: listing }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error listing directory: ${error.message}` }] };
    }
});
// Tool: Move file or directory
server.tool("move_file", { source: z.string().describe("Source path"), destination: z.string().describe("Destination path") }, async ({ source, destination }) => {
    try {
        const validSource = validatePath(source);
        const validDest = validatePath(destination);
        // Check if destination exists
        try {
            await fs.access(validDest);
            throw new Error('Destination already exists');
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
        await fs.rename(validSource, validDest);
        return { content: [{ type: 'text', text: `Moved successfully: ${source} -> ${destination}` }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error moving file/directory: ${error.message}` }] };
    }
});
// Tool: Get file info
server.tool("get_file_info", { path: z.string().describe("Path to file or directory") }, async ({ path: filePath }) => {
    try {
        const validPath = validatePath(filePath);
        const stats = await fs.stat(validPath);
        const info = {
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            accessed: stats.atime,
            permissions: stats.mode.toString(8)
        };
        return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error getting file info: ${error.message}` }] };
    }
});
// Tool: List allowed directories
server.tool("list_allowed_directories", {}, async () => {
    const resolvedDirs = allowedDirs.map(dir => path.resolve(dir));
    return { content: [{ type: 'text', text: resolvedDirs.join('\n') }] };
});
// Tool: Search files
server.tool("search_files", { path: z.string().describe("Starting directory"), pattern: z.string().describe("Search pattern"), excludePatterns: z.array(z.string()).optional().describe("Patterns to exclude") }, async ({ path: dirPath, pattern, excludePatterns = [] }) => {
    try {
        const validPath = validatePath(dirPath);
        const results = [];
        async function searchDir(currentPath) {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                // Check exclude patterns
                if (excludePatterns.some(exclude => fullPath.toLowerCase().includes(exclude.toLowerCase()))) {
                    continue;
                }
                // Check if name matches pattern
                if (entry.name.toLowerCase().includes(pattern.toLowerCase())) {
                    results.push(fullPath);
                }
                // Recursively search directories
                if (entry.isDirectory()) {
                    await searchDir(fullPath);
                }
            }
        }
        await searchDir(validPath);
        return { content: [{ type: 'text', text: results.join('\n') }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Error searching files: ${error.message}` }] };
    }
});
// Connect server using stdio transport
const transport = new StdioServerTransport();
server.connect(transport);
