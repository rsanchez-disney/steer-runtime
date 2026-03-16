# Confluence MCP Server

A Model Context Protocol (MCP) server for interacting with Confluence. This server provides tools to fetch, search, create, and update Confluence pages and spaces.

## Features

- **Get Pages**: Retrieve Confluence pages by ID or title
- **Search Pages**: Search pages using Confluence Query Language (CQL)
- **Manage Spaces**: Get space information and list all spaces
- **Create Pages**: Create new pages with optional parent hierarchy
- **Update Pages**: Update existing page content and metadata
- **Upload Attachments**: Upload files as attachments to Confluence pages
- **Add Comments**: Add formatted comments to pages

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` with your Confluence credentials:
   ```
   CONFLUENCE_URL=https://confluence.disney.com
   CONFLUENCE_PAT=your_confluence_personal_access_token
   ```
   
   **Important**: Do not include a trailing slash in the `CONFLUENCE_URL`. URLs with trailing slashes (e.g., `https://confluence.disney.com/`) will cause API request failures.
5. Build the project:
   ```bash
   npm run build
   ```

### Getting Your Confluence Personal Access Token

1. Go to [Disney Confluence Personal Access Tokens](https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action)
2. Click "Create token"
3. Give it a label (e.g., "MCP Server")
4. Copy the generated token to your `.env` file as `CONFLUENCE_PAT`

## Usage with Amazon Q CLI

Add this server to your Amazon Q CLI configuration (ex: `~/.aws/amazonq/mcp.json`):

```json
{
  "mcpServers": {
    "confluence": {
      "command": "node",
      "args": ["/path/to/confluence-mcp/build/index.js"],
      "cwd": "/path/to/confluence-mcp"
    }
  }
}
```

**Note**: The server automatically loads credentials from the `.env` file in its directory. No need to specify environment variables in the Q CLI configuration.

## Output Directory Options

The `outputDir` parameter supports three modes:

1. **Default (undefined)**: Saves to `/tmp/confluence-mcp/`
2. **Custom path (string)**: Saves to the specified directory
3. **Opt-out (false or null)**: Skips saving entirely

Example:
```javascript
// Default - saves to /tmp/confluence-mcp/
get_confluence_page({ pageId: "123456" })

// Custom path - useful for project-specific storage
get_confluence_page({ pageId: "123456", outputDir: ".amazonq/external-data" })

// Opt-out - doesn't save
get_confluence_page({ pageId: "123456", outputDir: false })
```

### Why `/tmp` as Default?

The default output directory is `/tmp/confluence-mcp` for several important reasons:

1. **Automatic cleanup**: System automatically clears `/tmp` on reboot and periodically removes old files
2. **No git conflicts**: Temporary data never accidentally gets committed to repositories
3. **No manual maintenance**: Users don't need to remember to clean up API response files
4. **Clean project directories**: Keeps project workspaces free of transient API data

**When to use custom `outputDir`:**
- **Project-specific context**: Use `.amazonq/external-data` when you need persistent data for Q's context across sessions
- **Debugging**: Specify a custom path when you need to review API responses after system restart
- **Documentation**: Save to a specific location when capturing data for reference or sharing

If you use a custom directory like `.amazonq/external-data`, add it to your `.gitignore`:

```
.amazonq/external-data/
```

## Available Tools

### get_confluence_page
Get a Confluence page by ID or title.

**Parameters:**
- `pageId` (string, optional): Page ID if getting by ID
- `spaceKey` (string, optional): Space key if getting by title
- `title` (string, optional): Page title if getting by title
- `expand` (string, optional): Properties to expand (default: "body.storage,version,space")
- `outputDir` (string, required): Directory to save the page data

**Example:**
```javascript
// Get by ID
await get_confluence_page({
  pageId: "123456789",
  outputDir: "./confluence-data"
});

// Get by title
await get_confluence_page({
  spaceKey: "PROJ",
  title: "Project Overview",
  outputDir: "./confluence-data"
});
```

### search_confluence_pages
Search Confluence pages using CQL (Confluence Query Language).

**Parameters:**
- `cql` (string, required): CQL query string
- `start` (number, optional): Start index for pagination (default: 0)
- `limit` (number, optional): Number of results (default: 25)
- `expand` (string, optional): Properties to expand (default: "version,space")
- `outputDir` (string, required): Directory to save search results

**Example:**
```javascript
await search_confluence_pages({
  cql: "space = PROJ AND type = page",
  outputDir: "./confluence-data"
});
```

### get_confluence_space
Get information about a Confluence space.

**Parameters:**
- `spaceKey` (string, required): Space key
- `expand` (string, optional): Properties to expand (default: "description.plain,homepage")
- `outputDir` (string, required): Directory to save space data

**Example:**
```javascript
await get_confluence_space({
  spaceKey: "PROJ",
  outputDir: "./confluence-data"
});
```

### list_confluence_spaces
List all Confluence spaces.

**Parameters:**
- `start` (number, optional): Start index for pagination (default: 0)
- `limit` (number, optional): Number of results (default: 25)
- `expand` (string, optional): Properties to expand (default: "description.plain")
- `outputDir` (string, required): Directory to save spaces data

**Example:**
```javascript
await list_confluence_spaces({
  outputDir: "./confluence-data"
});
```

### create_confluence_page
Create a new Confluence page.

**Parameters:**
- `spaceKey` (string, required): Space key where page will be created
- `title` (string, required): Page title
- `body` (string, required): Page content in Confluence storage format
- `parentId` (string, optional): Parent page ID
- `outputDir` (string, required): Directory to save created page data

**Example:**
```javascript
await create_confluence_page({
  spaceKey: "PROJ",
  title: "New Project Page",
  body: "<p>This is the page content in storage format.</p>",
  outputDir: "./confluence-data"
});
```

### update_confluence_page
Update an existing Confluence page.

**Parameters:**
- `pageId` (string, required): Page ID to update
- `title` (string, required): New page title
- `body` (string, required): New page content in Confluence storage format
- `version` (number, required): Current version number of the page
- `outputDir` (string, required): Directory to save updated page data

**Example:**
```javascript
await update_confluence_page({
  pageId: "123456789",
  title: "Updated Page Title",
  body: "<p>Updated content in storage format.</p>",
  version: 5,
  outputDir: "./confluence-data"
});
```

### comment_on_confluence_page
Add a comment to a Confluence page.

**Parameters:**
- `pageId` (string, required): Page ID to comment on
- `body` (string, required): Comment content in Confluence storage format
- `outputDir` (string, required): Directory to save comment data

**Example:**
```javascript
await comment_on_confluence_page({
  pageId: "123456789",
  body: "<p>This is a comment on the page.</p>",
  outputDir: "./confluence-data"
});
```

### upload_attachment
Upload a file as an attachment to a Confluence page.

**Parameters:**
- `pageId` (string, required): Page ID to attach the file to
- `filePath` (string, required): Local file path to upload
- `outputDir` (string, required): Directory to save attachment response data

**Example:**
```javascript
await upload_attachment({
  pageId: "123456789",
  filePath: "./images/screenshot.png",
  outputDir: "./confluence-data"
});
```

**Note:** After uploading an attachment, you can reference it in page content using:
```html
<ac:image><ri:attachment ri:filename="screenshot.png" /></ac:image>
```

## CQL (Confluence Query Language) Examples

Here are some useful CQL queries for searching:

```cql
# Find all pages in a space
space = "PROJ" AND type = page

# Find pages by title
title ~ "meeting notes"

# Find pages created by a specific user
creator = "john.doe"

# Find pages modified in the last week
lastModified >= now("-1w")

# Find pages with specific labels
label = "important"

# Combine conditions
space = "PROJ" AND type = page AND lastModified >= now("-1w")
```

## Development

### Watch Mode
```bash
npm run watch
```

### Inspector Mode
```bash
npm run inspector
```

## Error Handling

The server includes comprehensive error handling for:
- Missing environment variables
- Invalid Confluence credentials
- Network connectivity issues
- Invalid page IDs or space keys
- Permission errors

All errors are returned as structured responses with descriptive messages.

## File Output

All tools save their results to JSON files in the specified output directory:
- Page data: `page-{id}.json` or `page-{spaceKey}-{title}.json`
- Search results: `search-results-{timestamp}.json`
- Space data: `space-{spaceKey}.json`
- Spaces list: `spaces-list-{timestamp}.json`
- Created pages: `created-page-{id}.json`
- Updated pages: `updated-page-{id}.json`
- Comments: `comment-{id}-on-page-{pageId}.json`
- Attachments: `attachment-{id}-on-page-{pageId}.json`

## Recent Updates

### Version 0.1.1 (October 2025)
- **Fixed**: Version numbering issue in `update_confluence_page` - now uses current version instead of incrementing
- **Added**: `upload_attachment` tool for uploading files to Confluence pages
- **Improved**: Complete image attachment workflow (upload → reference → display)
- **Enhanced**: Error handling and documentation

### Version 0.1.0 (Initial Release)
- Core functionality for reading, creating, and updating Confluence pages
- Search capabilities with CQL support
- Space management tools
- Comment functionality

## License

MIT
