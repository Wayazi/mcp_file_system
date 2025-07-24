import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { promises as fs } from 'fs';
import * as path from 'path';
import os from 'os';
import { z } from 'zod';

// Helper type for MCP content items
type McpContent = { type: 'text'; text: string }[];

describe('Filesystem MCP Server', () => {
    let server: McpServer;
    let testDir: string;
    
    beforeAll(async () => {
        // Create a temporary test directory
        testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-fs-test-'));
        
        // Initialize server with test directory
        server = new McpServer({
            name: "filesystem-test",
            version: "1.0.0"
        });
    });

    afterAll(async () => {
        // Clean up test directory
        await fs.rm(testDir, { recursive: true, force: true });
    });

    beforeEach(async () => {
        // Clear test directory before each test
        const files = await fs.readdir(testDir);
        await Promise.all(
            files.map(file => fs.rm(path.join(testDir, file), { recursive: true, force: true }))
        );
    });

    describe('read_file tool', () => {
        it('should read file contents', async () => {
            const testFile = path.join(testDir, 'test.txt');
            const content = 'Hello, World!';
            await fs.writeFile(testFile, content);

            const readFileHandler = async ({ path: filePath }: { path: string }, extra: any) => {
                const content = await fs.readFile(filePath, 'utf-8');
                return { content: [{ type: 'text' as const, text: content }] };
            };

            server.tool("read_file", { path: z.string() }, readFileHandler);
            const result = await readFileHandler({ path: testFile }, {});
            expect(result.content[0].text).toBe(content);
        });
    });

    describe('write_file tool', () => {
        it('should write file contents', async () => {
            const testFile = path.join(testDir, 'write-test.txt');
            const content = 'Test content';

            const writeFileHandler = async ({ path: filePath, content }: { path: string, content: string }, extra: any) => {
                await fs.writeFile(filePath, content, 'utf-8');
                return { content: [{ type: 'text' as const, text: `File written successfully: ${filePath}` }] };
            };

            server.tool("write_file", { path: z.string(), content: z.string() }, writeFileHandler);
            const result = await writeFileHandler({ path: testFile, content }, {});

            expect(result.content[0].text).toContain('successfully');
            const writtenContent = await fs.readFile(testFile, 'utf-8');
            expect(writtenContent).toBe(content);
        });
    });

    describe('list_directory tool', () => {
        it('should list directory contents', async () => {
            await fs.writeFile(path.join(testDir, 'file1.txt'), 'content');
            await fs.writeFile(path.join(testDir, 'file2.txt'), 'content');
            await fs.mkdir(path.join(testDir, 'subdir'));

            const listDirHandler = async ({ path: dirPath }: { path: string }, extra: any) => {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                const listing = entries.map(entry => 
                    `[${entry.isDirectory() ? 'DIR' : 'FILE'}] ${entry.name}`
                ).join('\n');
                return { content: [{ type: 'text' as const, text: listing }] };
            };

            server.tool("list_directory", { path: z.string() }, listDirHandler);
            const result = await listDirHandler({ path: testDir }, {});
            const listing = result.content[0].text;

            expect(listing).toContain('[FILE] file1.txt');
            expect(listing).toContain('[FILE] file2.txt');
            expect(listing).toContain('[DIR] subdir');
        });
    });

    describe('move_file tool', () => {
        it('should move files', async () => {
            const sourceFile = path.join(testDir, 'source.txt');
            const destFile = path.join(testDir, 'dest.txt');
            await fs.writeFile(sourceFile, 'content');

            const moveFileHandler = async ({ source, destination }: { source: string, destination: string }, extra: any) => {
                await fs.rename(source, destination);
                return { content: [{ type: 'text' as const, text: `Moved successfully: ${source} -> ${destination}` }] };
            };

            server.tool("move_file", { source: z.string(), destination: z.string() }, moveFileHandler);
            const result = await moveFileHandler({
                source: sourceFile,
                destination: destFile
            }, {});

            expect(result.content[0].text).toContain('successfully');
            await expect(fs.access(sourceFile)).rejects.toThrow();
            await expect(fs.access(destFile)).resolves.toBeUndefined();
        });
    });

    describe('search_files tool', () => {
        it('should find files matching pattern', async () => {
            await fs.writeFile(path.join(testDir, 'test1.txt'), 'content');
            await fs.writeFile(path.join(testDir, 'test2.txt'), 'content');
            await fs.writeFile(path.join(testDir, 'other.txt'), 'content');

            const searchFilesHandler = async ({ path: dirPath, pattern }: { path: string, pattern: string }, extra: any) => {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                const results = entries
                    .filter(entry => entry.name.toLowerCase().includes(pattern.toLowerCase()))
                    .map(entry => entry.name);
                return { content: [{ type: 'text' as const, text: results.join('\n') }] };
            };

            server.tool("search_files", { path: z.string(), pattern: z.string() }, searchFilesHandler);
            const result = await searchFilesHandler({
                path: testDir,
                pattern: 'test'
            }, {});

            const searchResults = result.content[0].text;
            expect(searchResults).toContain('test1.txt');
            expect(searchResults).toContain('test2.txt');
            expect(searchResults).not.toContain('other.txt');
        });
    });

    describe('path validation security', () => {
        // Test the validatePath function directly using a similar implementation
        function validatePath(filePath: string, allowedDirs: string[]): string {
            const absolutePath = path.resolve(filePath);
            const isAllowed = allowedDirs.some(dir => {
                const resolvedDir = path.resolve(dir);
                // Ensure the path is within the directory by checking that it starts with the directory
                // followed by a path separator, or is exactly the directory
                return absolutePath === resolvedDir || 
                       absolutePath.startsWith(resolvedDir + path.sep);
            });
            
            if (!isAllowed) {
                throw new Error(`Access denied: ${filePath} is not within allowed directories`);
            }
            return absolutePath;
        }

        it('should block access to similar but unauthorized paths', () => {
            const allowedDirs = [testDir];
            const unauthorizedPath = testDir + '-but-dangerous';
            
            expect(() => validatePath(unauthorizedPath, allowedDirs)).toThrow('Access denied');
        });

        it('should allow access to files within allowed directories', () => {
            const allowedDirs = [testDir];
            const authorizedPath = path.join(testDir, 'file.txt');
            
            expect(() => validatePath(authorizedPath, allowedDirs)).not.toThrow();
        });

        it('should allow access to the allowed directory itself', () => {
            const allowedDirs = [testDir];
            
            expect(() => validatePath(testDir, allowedDirs)).not.toThrow();
        });

        it('should block path traversal attempts', () => {
            const allowedDirs = [testDir];
            const traversalPath = path.join(testDir, '../../../etc/passwd');
            
            expect(() => validatePath(traversalPath, allowedDirs)).toThrow('Access denied');
        });

        it('should handle multiple allowed directories correctly', () => {
            const testDir2 = path.join(testDir, 'subdir');
            const allowedDirs = [testDir, testDir2];
            
            expect(() => validatePath(path.join(testDir, 'file.txt'), allowedDirs)).not.toThrow();
            expect(() => validatePath(path.join(testDir2, 'file.txt'), allowedDirs)).not.toThrow();
            expect(() => validatePath('/unauthorized/path', allowedDirs)).toThrow('Access denied');
        });
    });
});