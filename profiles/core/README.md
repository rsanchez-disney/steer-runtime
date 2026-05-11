# Core Profile

Shared utility agents available to all profiles. These agents provide cross-cutting capabilities that any role (developer, QA, BA, PM, leadership) can use.

## Agents (6)

| Agent                    | Purpose                                                          |
|--------------------------|------------------------------------------------------------------|
| email_agent              | Sends emails via Compass MCP                                     |
| log_analyzer_agent       | Analyzes logs across Splunk, ServiceNow, and other systems       |
| story_analyzer_agent     | Fetches and analyzes Jira stories, Confluence pages, GitHub repos |
| document_analyzer_agent  | Parses PDFs, DOCX, XLSX, images with OCR support                 |
| deck_builder_agent       | Generates PPTX presentations from markdown or context            |
| ai_adoption_stats_agent  | Measures AI adoption across teams via GitHub and Jira data       |

## Structure

```text
profiles/core/
├── agents/       # 6 agent JSON configs
└── prompts/      # 6 agent prompt files
```

## Prerequisites

The `document_analyzer_agent` and `deck_builder_agent` require local CLI tools:

**macOS:**

```bash
brew install poppler tesseract pandoc
pip3 install python-pptx Pillow cairosvg openpyxl python-docx PyPDF2
```

**Windows:**

```powershell
winget install --id poppler.poppler -e
winget install --id UB-Mannheim.TesseractOCR -e
winget install --id JohnMacFarlane.Pandoc -e
pip install python-pptx Pillow cairosvg openpyxl python-docx PyPDF2
```

**Linux:**

```bash
sudo apt install poppler-utils tesseract-ocr pandoc
pip3 install python-pptx Pillow cairosvg openpyxl python-docx PyPDF2
```

## Install

```bash
koda install core    # Included automatically with all profiles
```
