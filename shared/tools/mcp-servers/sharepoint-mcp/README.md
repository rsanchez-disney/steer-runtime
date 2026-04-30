# SharePoint MCP Server

MCP server for reading, searching, and managing documents in SharePoint Online via Microsoft Graph API.

## Tools

| Tool | Description |
|------|-------------|
| `sharepoint_list_sites` | Search for SharePoint sites by keyword |
| `sharepoint_list_drives` | List document libraries for a site |
| `sharepoint_list_items` | List files/folders in a library path |
| `sharepoint_search_documents` | Search documents across SharePoint |
| `sharepoint_get_document` | Get document metadata and details |
| `sharepoint_upload_document` | Upload a local file to a library |

## Authentication

Uses Microsoft Graph API with OAuth 2.0 client credentials flow (app registration).

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `SHAREPOINT_TENANT_ID` | Azure AD tenant ID |
| `SHAREPOINT_CLIENT_ID` | App registration client ID |
| `SHAREPOINT_CLIENT_SECRET` | App registration client secret |
| `SHAREPOINT_SITE_URL` | Default site URL (e.g., `https://tenant.sharepoint.com/sites/mysite`) |

### Azure AD App Registration

1. Register an app in Azure AD
2. Add **Application** permission: `Sites.ReadWrite.All` (or `Sites.Read.All` for read-only)
3. Grant admin consent
4. Create a client secret

## Setup

```bash
# Add to tokens.env
SHAREPOINT_TENANT_ID=your-tenant-id
SHAREPOINT_CLIENT_ID=your-client-id
SHAREPOINT_CLIENT_SECRET=your-client-secret
SHAREPOINT_SITE_URL=https://your-tenant.sharepoint.com/sites/your-site
```

## Build

```bash
npm install
npm run build
npm run bundle
```
