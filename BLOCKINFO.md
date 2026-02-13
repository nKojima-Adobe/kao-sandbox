# BLOCK EXTRACTION INSTRUCTIONS (for Cursor AI)

**🚨 MANDATORY FIRST STEP - READ BEFORE PROCEEDING 🚨**

**YOU MUST START AT STEP 0 AND ASK THE USER QUESTIONS BEFORE DOING ANYTHING ELSE.**

**DO NOT:**
- Read files
- Search for files  
- Create folders
- Make assumptions about block names
- Skip to later steps
- **MODIFY SOURCE FILES** - Source files in `blocks/`, `models/`, or any location must NEVER be modified. Always copy first, then modify copies in export folder.

**YOU MUST:**
- Start at Step 0
- Ask the user for the block name (even if it seems obvious)
- Ask the user for the library folder name (REQUIRED, cannot be inferred)
- Wait for explicit user confirmation
- Only then proceed to file operations

---

You are Cursor AI. Your job is to **extract all code related to a specific EDS block** from this AEMaaCS/EDS repository and output a reusable folder under `./_block-export/` that can be copied into a Block Library repository.

This file is designed to be **fully interactive**.  
If you do not have enough information, you must **ask the user questions first** and wait for answers.
After receiving answers, **restart the execution of this file from the beginning**.

---

## 0. Gather required information from the user (MANDATORY)

**⚠️ CRITICAL: READ THIS SECTION CAREFULLY BEFORE PROCEEDING ⚠️**

**YOU MUST ASK THE USER QUESTIONS FIRST. DO NOT SKIP THIS STEP.**

**PROHIBITED ACTIONS (DO NOT DO THESE):**
- ❌ DO NOT assume block names from folder paths, even if they seem obvious
- ❌ DO NOT start searching for files before asking questions
- ❌ DO NOT read files or gather information before user confirmation
- ❌ DO NOT proceed to Step 1 or any later steps until Step 0 is complete
- ❌ DO NOT infer or guess the library folder name

**REQUIRED ACTIONS (YOU MUST DO THESE):**
- ✅ ALWAYS ask the user for BOTH required inputs (block name AND library folder name)
- ✅ WAIT for the user's explicit reply before proceeding
- ✅ Even if you see `blocks/accordion/` in the path, ASK for confirmation
- ✅ Even if the user mentions "accordion" in their query, ASK for the library folder name
- ✅ Treat this as a MANDATORY checkpoint - no exceptions

**CHECKLIST - You may ONLY proceed past Step 0 if:**
- [ ] You have explicitly asked the user for the block name
- [ ] You have explicitly asked the user for the library folder name  
- [ ] You have received explicit confirmation from the user for BOTH values
- [ ] You have NOT performed any file operations yet

---

Before doing any file operations, check whether you already know all of the following:

### User-Required Inputs
1. The **existing block name** in this repository  
   *(example: `cards`, `article-header`)*  
   **NOTE: Even if you see a folder like `blocks/accordion/`, you MUST ask the user to confirm this is correct.**

2. The **block folder name** to use in the Block Library  
   *(example: `Article-Header`)*  
   **NOTE: This is REQUIRED and cannot be inferred. You MUST ask the user.**

### If any required information is missing:
**STOP IMMEDIATELY. DO NOT PROCEED TO FILE OPERATIONS.**

Ask the user the following in ONE grouped message:

> Before I start extracting the block, I need a few details:
>
> **1. What is the current block name in this repository?**  
> (Example: `cards`, `article-header`)
>
> **2. What folder name should be used for this block in the Block Library?**  
> (Example: `Article-Header`)

**WAIT for the user's reply. DO NOT proceed until you receive explicit confirmation.**

**ONLY AFTER receiving the user's explicit confirmation**, proceed to search for source locations:

After receiving the block names, **automatically search** for the source locations:

### Automatic Source Location Discovery

1. **Search for block files** using these default patterns:
   - JS/TS files: `/blocks/<SOURCE_BLOCK_NAME>/`
   - CSS/SCSS files: `/blocks/<SOURCE_BLOCK_NAME>/`
   - Models/JSON files: `/models/`
   - Constants/Utils: `/constants/` for any files containing the block name
   - Additional search in: `/scripts/` folder for any related functions or imports
   - Additional search in: `/styles/` folder for any related CSS
   - Additional search in: `/utils/` folder for shared utility functions
   - Additional search: Repository root for any files containing the block name

2. **If files are found** in the default locations:
   - Store the discovered paths:
     - `SOURCE_BLOCK_NAME`
     - `LIBRARY_BLOCK_FOLDER_NAME`
     - `JS_ROOT_PATH` (discovered)
     - `CSS_ROOT_PATH` (discovered)
     - `MODELS_ROOT_PATH` (discovered)
   
   - Repeat the values back to the user for confirmation:
   
   > Got it. I found the block files at these locations:
   > - Block name in this repository: `SOURCE_BLOCK_NAME = ...`
   > - Library folder name: `LIBRARY_BLOCK_FOLDER_NAME = ...`
   > - JS/TS files found in: `JS_ROOT_PATH = ...`
   > - CSS/SCSS files found in: `CSS_ROOT_PATH = ...`
   > - Models found in: `MODELS_ROOT_PATH = ...`
   > - Total files discovered: [count]
   >
   > If this looks correct, I will begin the extraction.

3. **If files are NOT found** in the default locations:
   - Explain what was searched
   - Ask the user to specify paths manually:
   
   > I searched for block files but couldn't find them in the expected locations:
   > - Searched: `/blocks/<SOURCE_BLOCK_NAME>/`
   > - Searched: `/models/`
   >
   > Please specify where the block files are located:
   > - JS/TS root path (or "none" if not applicable)
   > - CSS/SCSS root path (or "none" if not applicable)
   > - Models/JSON root path (or "none" if not applicable)
   > - (Optional) Any additional paths to scan

   Wait for the user's reply, then store the manually provided paths.

**IMPORTANT:**  
All discovered or manually provided paths must be recorded in `extraction-information.md` for future reference.
If paths are missing, invalid, or unclear, **explain the issue clearly and ask again instead of 
guessing**.

**REMINDER:** If you skipped asking the user questions and started searching for files, STOP IMMEDIATELY, go back to the beginning of Step 0, and ask the required questions first.

---

## 1. Analyze and normalize block naming

**⚠️ VALIDATION CHECKPOINT ⚠️**

Before proceeding to Step 1, verify:
- ✅ You have asked the user for the block name AND received confirmation
- ✅ You have asked the user for the library folder name AND received confirmation
- ✅ You have NOT performed any file operations yet (except searching for file locations in Step 0)

**If any of the above is false, STOP and go back to Step 0.**

Once user input is confirmed, perform a comprehensive naming analysis:

### 1.1 Identify all block-related naming patterns

Scan the entire block's codebase to find:

1. **Block name variations:**
   - File names (e.g., `article-header.js`, `article-header.css`)
   - Folder names (e.g., `/blocks/article-header/`)
   - Export names (e.g., `export default function ArticleHeader()`)
   - Display names in comments or configs

2. **CSS class name patterns:**
   - Main block class (e.g., `.article-header`)
   - BEM variants (e.g., `.article-header__title`, `.article-header--featured`)
   - Dynamic classes in JS (e.g., `classList.add('article-header-active')`)

3. **JavaScript naming patterns:**
   - Function names (e.g., `decorateArticleHeader()`)
   - Variable names (e.g., `articleHeaderConfig`)
   - Import/export references

4. **JSON/Config references:**
   - Model IDs or keys
   - Configuration property names

### 1.2 Create a naming mapping file

Create a comprehensive mapping in:
`./_block-export/LIBRARY_BLOCK_FOLDER_NAME/naming-map.json`

**Structure for single block:**

```json
{
  "blockType": "single",
  "original": {
    "blockName": "article-header",
    "classPrefix": "article-header",
    "functionPrefix": "ArticleHeader",
    "variablePrefix": "articleHeader"
  },
  "patterns": {
    "files": ["article-header.js", "article-header.css"],
    "cssClasses": [".article-header", ".article-header__title", ".article-header--featured"],
    "jsFunctions": ["decorateArticleHeader", "initArticleHeader"],
    "jsVariables": ["articleHeaderConfig", "articleHeaderData"],
    "imports": ["import ArticleHeader from", "export default ArticleHeader"]
  },
  "placeholders": {
    "blockName": "{BLOCK_NAME}",
    "classPrefix": "{BLOCK_CLASS}",
    "functionPrefix": "{BLOCK_FUNC}",
    "variablePrefix": "{BLOCK_VAR}"
  }
}
```

**Structure for parent/child blocks:**

```json
{
  "blockType": "parent-child",
  "original": {
    "parent": {
      "blockName": "carousel",
      "classPrefix": "carousel",
      "functionPrefix": "Carousel",
      "variablePrefix": "carousel"
    },
    "child": {
      "blockName": "carousel-item",
      "classPrefix": "carousel-item",
      "functionPrefix": "CarouselItem",
      "variablePrefix": "carouselItem"
    }
  },
  "patterns": {
    "parent": {
      "files": ["carousel.js", "carousel.css"],
      "cssClasses": [".carousel", ".carousel__container"],
      "jsFunctions": ["decorateCarousel"],
      "jsVariables": ["carouselConfig"]
    },
    "child": {
      "files": ["carousel-item.js", "carousel-item.css"],
      "cssClasses": [".carousel-item", ".carousel-item__content"],
      "jsFunctions": ["decorateCarouselItem"],
      "jsVariables": ["carouselItemData"]
    }
  },
  "placeholders": {
    "parent": {
      "blockName": "{PARENT_BLOCK_NAME}",
      "classPrefix": "{PARENT_CLASS}",
      "functionPrefix": "{PARENT_FUNC}",
      "variablePrefix": "{PARENT_VAR}"
    },
    "child": {
      "blockName": "{CHILD_BLOCK_NAME}",
      "classPrefix": "{CHILD_CLASS}",
      "functionPrefix": "{CHILD_FUNC}",
      "variablePrefix": "{CHILD_VAR}"
    }
  }
}
```

### 1.3 Replace all references with placeholders

**CRITICAL:** Before copying any files, replace all identified names with placeholders:

1. **Replace in all file names:**
   - `article-header.js` → `{BLOCK_NAME}.js`
   - `article-header.css` → `{BLOCK_NAME}.css`

2. **Replace in all file contents:**
   - CSS: `.article-header` → `.{BLOCK_CLASS}`
   - CSS: `.article-header__title` → `.{BLOCK_CLASS}__title`
   - CSS: `.article-header--featured` → `.{BLOCK_CLASS}--featured`
   - JS: `function ArticleHeader()` → `function {BLOCK_FUNC}()`
   - JS: `const articleHeaderConfig` → `const {BLOCK_VAR}Config`
   - JS: `classList.add('article-header-active')` → `classList.add('{BLOCK_CLASS}-active')`

3. **Preserve important patterns:**
   - Keep BEM suffixes intact: `__title`, `--featured`, `-active`
   - Keep camelCase/PascalCase/kebab-case conventions
   - Document any complex naming patterns that couldn't be automatically replaced

4. **Create a replacement log:**

Add to `naming-map.json`:

```json
{
  "replacements": [
    {
      "file": "article-header.js",
      "type": "filename",
      "original": "article-header.js",
      "placeholder": "{BLOCK_NAME}.js",
      "pattern": "kebab-case"
    },
    {
      "file": "{BLOCK_NAME}.js",
      "line": 12,
      "type": "function",
      "original": "export default function ArticleHeader()",
      "placeholder": "export default function {BLOCK_FUNC}()",
      "pattern": "PascalCase"
    },
    {
      "file": "{BLOCK_NAME}.css",
      "line": 5,
      "type": "css-class",
      "original": ".article-header__title",
      "placeholder": ".{BLOCK_CLASS}__title",
      "pattern": "BEM-element"
    }
  ]
}
```

### 1.4 Validation

After replacement:

1. **Verify placeholder consistency:**
   - Count total placeholders used
   - Ensure no original names remain (except in comments/docs if intentional)
   - Check that placeholder format is correct

2. **Test file validity:**
   - Ensure files still have valid syntax (JS/CSS parseable)
   - Check that string replacements didn't break code logic

3. **Document edge cases:**
   - List any names that couldn't be replaced automatically
   - Note any complex patterns requiring manual review during implementation
   - Flag any hardcoded strings that might need attention

**If any validation fails:**
- Stop the extraction process
- Report specific issues found
- Ask user how to proceed

---

## 2. Create the export folder

Once naming normalization is complete:

1. Create the folder:  
   `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`

2. Inside the final export directory, create:
   - `extraction-information.md` (stores block names, discovered/provided paths, and search results)
   - `naming-map.json` (comprehensive naming mapping with placeholders)
   - `summary.md` (final summary of extracted files)

**Note:** All extracted files (JS, CSS, JSON, docs) will be placed directly in the `LIBRARY_BLOCK_FOLDER_NAME` directory, not in subfolders. All names will already be replaced with placeholders.

---

## 2. Collect JS/TS code

**🚨 CRITICAL: SOURCE FILES MUST NEVER BE MODIFIED 🚨**

**WORKFLOW:**
1. **Copy** source files to export folder (preserving originals)
2. **Then modify** the copies in the export folder
3. **Never modify** files in `blocks/`, `models/`, or any source location

**PROHIBITED:**
- ❌ DO NOT modify files in `blocks/<SOURCE_BLOCK_NAME>/`
- ❌ DO NOT modify files in `models/` or any source location
- ❌ DO NOT apply placeholder replacements to source files
- ❌ DO NOT edit source files and then revert them

**REQUIRED:**
- ✅ Copy source files to `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/` FIRST
- ✅ Apply placeholder replacements ONLY to files in the export folder
- ✅ Leave all source files completely untouched

---

1. Under `JS_ROOT_PATH`:
   - Search recursively for all JS/TS files related to `SOURCE_BLOCK_NAME`.

Look for:
- File names containing the block name
- Component definitions
- Imports/exports using the block name
- Supporting utility files inside the block folder

2. **Scan `/scripts/` folder:**
   - Search for any functions imported by the block
   - Identify dependencies (e.g., `moveInstrumentation`, `decorateIcons`)
   - Document these as external dependencies

3. **Scan `/constants/` folder:**
   - Find any constants files related to the block
   - Copy block-specific constant files

4. **Scan `/utils/` folder:**
   - Identify any shared utility functions used by the block
   - Document these as external dependencies

5. **Copy source files to export folder FIRST:**
   - Copy all JS/TS files from source location to:  
     `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`
   - Use original file names during copy (e.g., `carousel.js`, `carousel-utils.js`)
   - **DO NOT modify source files** - only copy them

6. **Replace names with placeholders IN THE EXPORT FOLDER:**
   - After copying, apply all placeholder replacements from `naming-map.json`
   - Modify files ONLY in `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`
   - Update file names: `carousel.js` → `{BLOCK_NAME}.js`
   - Update contents: function names, variable names, class references
   - Verify syntax remains valid after replacement

   All JS/TS files should be placed directly in the root of `LIBRARY_BLOCK_FOLDER_NAME`, with placeholder names (e.g., `{BLOCK_NAME}.js`, `utils.js`).

---

## 3. Collect CSS/SCSS code

**🚨 CRITICAL: SOURCE FILES MUST NEVER BE MODIFIED 🚨**

**WORKFLOW:**
1. **Copy** source CSS files to export folder (preserving originals)
2. **Then modify** the copies in the export folder
3. **Never modify** CSS files in `blocks/` or any source location

---

1. Under `CSS_ROOT_PATH`:
   - Find all CSS/SCSS files that style or reference the block.

2. **Scan `/styles/` folder:**
   - Search for any global styles that reference the block
   - Check if the block depends on any style variables or mixins
   - Document global style dependencies

3. **Copy source files to export folder FIRST:**
   - Copy all CSS/SCSS files from source location to:  
     `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`
   - Use original file names during copy (e.g., `carousel.css`)
   - **DO NOT modify source files** - only copy them

4. **Replace names with placeholders IN THE EXPORT FOLDER:**
   - After copying, apply all placeholder replacements from `naming-map.json`
   - Modify files ONLY in `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`
   - Update file names: `carousel.css` → `{BLOCK_NAME}.css`
   - Update CSS selectors: `.carousel` → `.{BLOCK_CLASS}`
   - Update BEM patterns: `.carousel__title` → `.{BLOCK_CLASS}__title`
   - Update modifiers: `.carousel--featured` → `.{BLOCK_CLASS}--featured`
   - Verify CSS syntax remains valid after replacement

   All CSS/SCSS files should be placed directly in the root of `LIBRARY_BLOCK_FOLDER_NAME`, with placeholder names (e.g., `{BLOCK_NAME}.css`, `{BLOCK_NAME}.scss`).

   Do **not** copy global styles unless the block explicitly depends on them.  
If you must copy something global, document it in the summary.

---

## 4. Collect JSON/config/model files

**🚨 CRITICAL: SOURCE FILES MUST NEVER BE MODIFIED 🚨**

**WORKFLOW:**
1. **Copy** source JSON files to export folder (preserving originals)
2. **Then modify** the copies in the export folder
3. **Never modify** JSON files in `models/` or `blocks/` or any source location

---

1. Under `MODELS_ROOT_PATH`, find:
   - Block-specific models
   - Config entries
   - Any JSON/MD documentation containing block metadata

2. **Copy source files to export folder FIRST:**
   - Copy block-specific files from source location to:  
     `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`
   - Use original file names during copy (e.g., `_carousel.json`)
   - **DO NOT modify source files** - only copy them

3. **Replace names with placeholders IN THE EXPORT FOLDER:**
   - After copying, apply all placeholder replacements from `naming-map.json`
   - Modify files ONLY in `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`
   - Update JSON IDs, names, and references with placeholders
   - Verify JSON syntax remains valid after replacement

   All JSON/config files should be placed directly in the root of `LIBRARY_BLOCK_FOLDER_NAME`, maintaining their original filenames with extensions (e.g., `model.json`, `config.json`).

4. For files that contain multiple blocks (e.g. `models/_section.json`):
   - Extract **only** the JSON fragment related to this block.
   - Save to:  
     `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/model-snippet.json`
   - **DO NOT modify** the original `models/_section.json` file

5. In the summary, explain what this snippet does and where it should be merged later.

---

## 5. Collect documentation snippets (if available)

If the repository contains:

- README files  
- Storybook docs  
- Full-page demos  
- Authoring guidance  
- Marketing text  
- Examples  

Then extract relevant block-related sections into:  
`./_block-export/LIBRARY_BLOCK_FOLDER_NAME/description.md`

If no documentation exists, auto-generate a minimal description including:

- What the block appears to do
- Key UI/UX characteristics inferred from code
- Any missing or uncertain details

---

## 6. Write the extraction output summary

Write a human-readable summary to:  
`./_block-export/LIBRARY_BLOCK_FOLDER_NAME/summary.md`

Include:

- Block names (source and library folder name)
- **Naming normalization summary:**
  - Original block name(s)
  - Placeholder scheme used (`{BLOCK_NAME}`, `{BLOCK_CLASS}`, etc.)
  - Total number of replacements made
  - Any names that couldn't be automatically replaced
- How paths were determined (automatically discovered or manually provided)
- Exact paths scanned  
- Every file copied (list them with placeholder names)  
- Any dependencies that remain external  
- Block behavior summary (if inferred from code)  
- Notes for the user about next steps in the Block Library
- **Important:** Remind the user that all files contain placeholders and must have names filled in during implementation  

---

## 7. README Generation (MANDATORY)

Generate a human-friendly `README.md` in `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/README.md` by analyzing extracted files. Include: (1) block summary (2-4 sentences), (2) key features and behaviors, (3) organized file list, (4) use cases (3-6 examples), (5) integration notes (dependencies, requirements). Write in simple, clear language using bullet points. Avoid referencing the extraction process or AI tools. If details cannot be inferred, add: "Note: Some features could not be inferred due to limited context in the extracted files."

---

## 8. Create Implementation Instructions File (MANDATORY)

Create a file called `implementation.md` in the extracted folder with the complete implementation instructions:

**Destination:** `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/implementation.md`

**CRITICAL INSTRUCTIONS:**

1. **You MUST copy the ENTIRE content** from the "APPENDIX: BLOCK IMPLEMENTATION INSTRUCTIONS TEMPLATE" section at the end of this document (starting from line ~495 onwards).

2. **DO NOT summarize, reference, or abbreviate** the content. The implementation.md file must contain:
   - The complete title: "# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)"
   - All 12 numbered sections (0 through 12)
   - All subsections (0.1, 0.2, 0.3, 2.1, 2.2, 4.1, 4.2, etc.)
   - All code examples and bash snippets
   - All user prompts with the `>` formatting
   - The entire content, which should be approximately 500+ lines

3. **The file is long intentionally** - it needs to be self-contained and complete so it can be used independently in the target project.

4. **Copy method:** 
   - Read the entire APPENDIX section from this file (from the heading "# APPENDIX: BLOCK IMPLEMENTATION INSTRUCTIONS TEMPLATE" to the end)
   - Write ALL of that content (excluding only the "# APPENDIX" heading itself) to the new `implementation.md` file
   - The first line of the new file should be: "# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)"

5. **DO NOT:**
   - Create a shorter version
   - Add a reference like "See APPENDIX in extraction.md"
   - Summarize or condense the instructions
   - Skip any sections thinking they're "optional"

This file will serve as an interactive guide for Cursor AI to integrate the extracted block into a target AEM EDS project. It contains:
- Environment validation steps
- User input gathering  
- Naming map reading and placeholder replacement
- File copying and integration logic
- Testing procedures
- Cleanup instructions

**Expected file size:** The implementation.md file should be approximately 500-600 lines long.

---

## 8.5. VALIDATION - Verify All Required Files Were Created (MANDATORY)

Before providing the final response to the user, perform these validation checks:

### 8.5.1 Check all mandatory files exist

Verify these files exist in `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`:

- ✅ `naming-map.json`
- ✅ `extraction-information.md`
- ✅ `summary.md`
- ✅ `README.md`
- ✅ `implementation.md`

**If any file is missing:**
> ERROR: Extraction incomplete. Missing required file: [filename]
> Please create this file before completing the extraction.

Stop and fix the issue.

### 8.5.2 Validate file contents are not empty

Check that each mandatory file has content (not just an empty file):

```bash
# Each file should have more than 0 bytes
```

**If any file is empty:**
> ERROR: Required file is empty: [filename]
> Please ensure all required files have proper content.

Stop and fix the issue.

### 8.5.3 Validate implementation.md is complete (CRITICAL)

**This is the most important check!**

The `implementation.md` file MUST be complete and self-contained:

1. **Check file length:**
   - The file should be approximately 500-600 lines long
   - Minimum acceptable: 450 lines
   
2. **Check for key sections:**
   - Must contain: "# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)"
   - Must contain: "# 0. ENVIRONMENT VALIDATION (MANDATORY)"
   - Must contain: "# 1. GATHER USER INPUT (MANDATORY)"
   - Must contain: "# 2. READ EXTRACTION METADATA AND NAMING MAP (MANDATORY)"
   - Must contain: "# 3. DERIVE TARGET NAMES FROM USER INPUT (MANDATORY)"
   - Must contain: "# 4. REPLACE ALL PLACEHOLDERS IN EXTRACTED FILES (CRITICAL)"
   - Must contain: "# 5. COPY JS/TS FILES INTO THE TARGET PROJECT"
   - Must contain: "# 6. COPY CSS/SCSS FILES INTO THE TARGET PROJECT"
   - Must contain: "# 7. REGISTER MODEL / CONFIG FILES"
   - Must contain: "# 8. UPDATE BLOCK INDEX / ROUTER (OPTIONAL)"
   - Must contain: "# 9. SANITY CHECKS"
   - Must contain: "# 10. RUN TESTS (IF NO ISSUES FOUND)"
   - Must contain: "# 11. CLEANUP - DELETE TEMPORARY EXTRACTION FOLDER"
   - Must contain: "# 12. FINAL SUMMARY TO USER"

3. **Check it's not a reference:**
   - Must NOT contain phrases like "See APPENDIX"
   - Must NOT contain phrases like "Refer to extraction.md"
   - Must NOT contain phrases like "Content omitted for brevity"

**If implementation.md validation fails:**
> ERROR: implementation.md file is incomplete or invalid.
> - Current line count: [count] (expected: 500-600 lines)
> - Missing sections: [list any missing section headers]
> 
> The implementation.md file MUST contain the complete template from the APPENDIX.
> Please recreate this file with the full content.

Stop and recreate the file properly.

### 8.5.4 Validate naming-map.json is valid JSON

Try to parse `naming-map.json` to ensure it's valid JSON:

**If JSON is invalid:**
> ERROR: naming-map.json contains invalid JSON syntax.
> Error: [parse error]
> 
> Please fix the JSON syntax before completing extraction.

Stop and fix the issue.

### 8.5.5 Validate extracted files have placeholders

Check that extracted JS/CSS files contain placeholders like:
- `{BLOCK_NAME}`
- `{BLOCK_CLASS}`
- `{BLOCK_FUNC}` or `{BLOCK_VAR}`

**If NO placeholders found in extracted files:**
> WARNING: No placeholders found in extracted files.
> This might mean the placeholder replacement in Step 1 did not complete.
> 
> Please verify that naming normalization was performed correctly.

Warn the user but allow them to proceed if they confirm.

### 8.5.6 Final validation summary

After all checks pass, create a brief validation report:

```
✅ VALIDATION PASSED

All required files created:
- naming-map.json (X KB)
- extraction-information.md (X KB)
- summary.md (X KB)
- README.md (X KB)
- implementation.md (X lines, X KB) ✓ COMPLETE

Extracted files:
- X JS/TS files with placeholders
- X CSS/SCSS files with placeholders
- X JSON files

Validation: All checks passed. Extraction is complete.
```

Only proceed to the final response (Step 9) after validation passes.

---

## 9. Final Response to the User

**ONLY provide this response after Step 8.5 validation passes.**

After completing all steps and validation, respond with:

> ✅ **Extraction Complete and Validated!**
>
> Export folder: `./_block-export/LIBRARY_BLOCK_FOLDER_NAME/`  
>
> **Naming Normalization:**
> - All block names replaced with placeholders: `{BLOCK_NAME}`, `{BLOCK_CLASS}`, etc.
> - Placeholder mapping saved to: `naming-map.json`
> - Total replacements made: [count]
>
> **Files Extracted:**
> - JS files: [list with placeholder names like `{BLOCK_NAME}.js`]  
> - CSS files: [list with placeholder names like `{BLOCK_NAME}.css`]  
> - JSON/model files: [list]  
> - Documentation: [list]  
>
> **Generated Files (All Verified):**
> - ✅ `naming-map.json` - Complete placeholder mapping ([X] KB)
> - ✅ `summary.md` - Extraction summary ([X] KB)
> - ✅ `README.md` - Block documentation ([X] KB)
> - ✅ `implementation.md` - **COMPLETE** implementation instructions ([X] lines, [X] KB)
> - ✅ `extraction-information.md` - Source paths and metadata ([X] KB)
>
> **Validation Results:**
> - ✅ All 5 mandatory files created and validated
> - ✅ implementation.md is complete with all 12 sections (500+ lines)
> - ✅ naming-map.json has valid JSON syntax
> - ✅ Extracted files contain proper placeholders
> - ✅ No files are empty
>
> **Important:** All extracted files contain placeholders. When implementing this block into a target project:
> 1. Copy the entire `LIBRARY_BLOCK_FOLDER_NAME` folder into the target project's `_block-export/` directory
> 2. Open and follow `implementation.md` - it's a complete, self-contained guide
> 3. The AI will prompt you for the block name and automatically handle all placeholder replacements
>
> Please review the `summary.md` file for important notes, dependencies, and next steps.

If at any point files cannot be found or paths produce zero matches:
- Stop
- Clearly explain what was searched
- Ask the user what to adjust

Do **not** continue silently when something expected is missing.

---

---

# APPENDIX: BLOCK IMPLEMENTATION INSTRUCTIONS TEMPLATE

**IMPORTANT INSTRUCTIONS FOR EXTRACTION PROCESS:**

When you reach Step 8 of the extraction process, you must copy **ALL** of the content below (starting from the next line with "# BLOCK IMPLEMENTATION INSTRUCTIONS") into the file:
`./_block-export/LIBRARY_BLOCK_FOLDER_NAME/implementation.md`

**DO NOT:**
- Summarize or shorten this content
- Add a reference or link to this file
- Skip any sections
- Create an abbreviated version

**YOU MUST:**
- Copy the ENTIRE template below (approximately 500+ lines)
- Include all 12 main sections (0 through 12)
- Include all subsections, code blocks, and user prompts
- Preserve all formatting, including `>` quote blocks and code fences

**The content to copy starts on the next line:**

---

# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

You are Cursor AI.  
You are currently inside a block folder that was generated by the block extraction process and then manually placed into a **target AEMaaCS/EDS project**.

Your job is to **integrate this block into the target project**, using the extracted JS, CSS, JSON, and documentation that exist inside this folder.

This file is **fully interactive**.  
If you do not have enough information, you must **ask the user questions first** and wait for answers.  
After receiving answers, **restart the execution of this file from the beginning**.

---

# 0. ENVIRONMENT VALIDATION (MANDATORY)

Before you do anything, you must validate:

1. **That this file is located inside a `_block-export/` folder within a project**
2. **That the required extracted files/folders exist**
3. **That the surrounding project appears to be an AEM Edge Delivery Services (EDS) project**

If any of these checks fail → **STOP immediately**, explain the issue, and ask the user to correct it.

---

## 0.1 Validate folder location

Verify that:

- The current directory path includes:  
  `/_block-export/`  
  Example:  
  `/target-project/_block-export/Article-Header/IMPLEMENTATION.md`

If `_block-export/` is not in the path:

> ERROR: This IMPLEMENTATION.md file must be placed in a folder under `/_block-export/` inside the target project.  
> Current path appears incorrect.  
> Please place this extracted block folder inside your target repository and try again.

(Stop execution until user fixes the placement.)

---

## 0.2 Validate required extracted contents

Inside this folder, ensure the minimum required contents exist:

Required files (at least one of each type):

- `.js` or `.ts` files (JavaScript/TypeScript)
- `.css` or `.scss` files (Stylesheets)
- `.json` files (Models/Configuration)

Optional but recommended:

- `extraction-information.md`
- `summary.md`
- `description.md`

All files should be located directly in the root of `LIBRARY_BLOCK_FOLDER_NAME`, not in subfolders.

If no files of the required types are found:

> ERROR: Missing required files: [JS/TS, CSS/SCSS, or JSON files].  
> This block cannot be implemented until all required file types exist.  
> Please ensure the extraction was done correctly.

Stop execution and ask the user how they want to proceed.

---

## 0.3 Validate that the target repository is an EDS project

Check the folder structure *outside* this `_block-export` directory.

Look for at least one of the following:

- A `/blocks/` directory  
- A `/models/` directory  
- A `/styles/` or `/styles/blocks/` directory  
- EDS config files (any of the following):  
  - `fstab.yaml`  
  - `helix-config.yaml`  
  - `helix-query.yaml`  
  - `package.json` references to Adobe/Franklin/EDS tools

If **none** of these exist:

> ERROR: This repository does not appear to be an EDS project.  
> I was expecting to find directories such as `/blocks/`, `/models/`, or EDS config files.  
> Please confirm that this is an EDS project before continuing.

Stop and ask the user for clarification.

---

# 1. GATHER USER INPUT (MANDATORY)

Before performing any file operations, ask the user for:

> Before I start implementing this block into your project, I need a few details:
>
> **1. What should this block be named in this project?**
> - If it is a single block, provide:  
>   `TARGET_BLOCK_NAME` (e.g. `article-header`)
> - If it is a parent/child pair (e.g. container + item), provide:  
>   `PARENT_BLOCK_NAME` and `CHILD_BLOCK_NAME`
>
> **2. Where is the global model/registration file?**  
> - Path to global registration file (e.g. `/models/_section.json`)
>
> **3. Any naming conventions or project rules I should follow?**

Wait for the user's reply.

Store:

- `TARGET_BLOCK_NAME` **or** (`PARENT_BLOCK_NAME`, `CHILD_BLOCK_NAME`)
- `GLOBAL_MODEL_PATH`
- `BLOCK_INDEX_PATH` (optional)

**Note:** Files will automatically be placed in this block's dedicated folder:
- JS/TS files: Create and populate `Blocks/TARGET_BLOCK_NAME/` (or separate folders for parent/child blocks)
- CSS/SCSS files: Place in the same `Blocks/TARGET_BLOCK_NAME/` folder alongside JS files
- JSON/Models: Merge this block's model into `GLOBAL_MODEL_PATH`

**Each block gets its own isolated folder. Do not mix files from different blocks.**

Repeat back to the user to confirm correctness before continuing.

If unclear → explain the issue and ask again.

---

# 2. READ EXTRACTION METADATA AND NAMING MAP (MANDATORY)

## 2.1 Read extraction metadata

If the file `extraction-information.md` exists:

- Read original block name (`SOURCE_BLOCK_NAME`)
- Read any notes about dependencies, naming, or custom folder structures
- Use it to guide renaming and conflict resolution

If the file does not exist, proceed without it but mention this in the final summary.

## 2.2 Read naming map (CRITICAL)

The file `naming-map.json` is **MANDATORY** and contains:
- The placeholder scheme used during extraction
- All patterns that need to be replaced
- Original naming conventions

**Read `naming-map.json` and understand:**

1. **Block type:** Is this a single block or parent/child pattern?

2. **Placeholder patterns used:**
   - `{BLOCK_NAME}` - in file names and kebab-case references
   - `{BLOCK_CLASS}` - in CSS classes and kebab-case strings
   - `{BLOCK_FUNC}` - in PascalCase function names
   - `{BLOCK_VAR}` - in camelCase variable names
   - For parent/child: `{PARENT_BLOCK_NAME}`, `{CHILD_BLOCK_NAME}`, etc.

3. **What needs to be replaced:**
   - File names containing placeholders
   - CSS selectors and class names
   - JavaScript function and variable names
   - Import/export statements
   - String literals in code

If `naming-map.json` is missing:
> ERROR: The `naming-map.json` file is missing.  
> This file is required to properly rename the block during implementation.  
> The extraction may have been incomplete. Please re-extract the block or create the naming map manually.

Stop execution until resolved.

---

# 3. DERIVE TARGET NAMES FROM USER INPUT (MANDATORY)

Based on the user's input from Step 1, automatically derive all necessary naming variations:

## 3.1 For single blocks:

If user provided: `TARGET_BLOCK_NAME = "my-custom-header"`

Automatically generate:
- **File/folder name (kebab-case):** `my-custom-header`
- **CSS class prefix (kebab-case):** `my-custom-header`
- **Function name (PascalCase):** `MyCustomHeader`
- **Variable name (camelCase):** `myCustomHeader`

## 3.2 For parent/child blocks:

If user provided: 
- `PARENT_BLOCK_NAME = "product-carousel"`
- `CHILD_BLOCK_NAME = "product-card"`

Automatically generate:

**Parent:**
- File/folder: `product-carousel`
- CSS class: `product-carousel`
- Function: `ProductCarousel`
- Variable: `productCarousel`

**Child:**
- File/folder: `product-card`
- CSS class: `product-card`
- Function: `ProductCard`
- Variable: `productCard`

## 3.3 Confirm with user

Display the derived names and ask for confirmation:

> I will use these names for your block:
>
> **File names:** `my-custom-header.js`, `my-custom-header.css`
> **CSS classes:** `.my-custom-header`, `.my-custom-header__element`, `.my-custom-header--modifier`
> **JS functions:** `MyCustomHeader()`, `decorateMyCustomHeader()`
> **JS variables:** `myCustomHeader`, `myCustomHeaderConfig`
>
> If this looks correct, I will proceed with the replacement.
> If you need different naming patterns, please specify them now.

Wait for user confirmation before proceeding.

---

# 4. REPLACE ALL PLACEHOLDERS IN EXTRACTED FILES (CRITICAL)

**Before copying any files to the target project, replace all placeholders:**

## 4.1 Create replacement mapping

From the user-confirmed names, create a replacement map:

```javascript
{
  "{BLOCK_NAME}": "my-custom-header",
  "{BLOCK_CLASS}": "my-custom-header",
  "{BLOCK_FUNC}": "MyCustomHeader",
  "{BLOCK_VAR}": "myCustomHeader"
}
```

For parent/child blocks:

```javascript
{
  "{PARENT_BLOCK_NAME}": "product-carousel",
  "{PARENT_CLASS}": "product-carousel",
  "{PARENT_FUNC}": "ProductCarousel",
  "{PARENT_VAR}": "productCarousel",
  "{CHILD_BLOCK_NAME}": "product-card",
  "{CHILD_CLASS}": "product-card",
  "{CHILD_FUNC}": "ProductCard",
  "{CHILD_VAR}": "productCard"
}
```

## 4.2 Replace in file names

1. Scan all files in the extracted folder
2. Rename files containing placeholders:
   - `{BLOCK_NAME}.js` → `my-custom-header.js`
   - `{BLOCK_NAME}.css` → `my-custom-header.css`
   - `{PARENT_BLOCK_NAME}.js` → `product-carousel.js`
   - `{CHILD_BLOCK_NAME}.js` → `product-card.js`

## 4.3 Replace in file contents

For each file (JS, CSS, JSON):

1. **Read the entire file content**
2. **Apply all placeholder replacements** using the mapping from 4.1
3. **Write the updated content back**

**Important replacement order:**
- Replace longer placeholders first to avoid partial replacements
- Example: Replace `{PARENT_BLOCK_NAME}` before `{BLOCK_NAME}`

## 4.4 Validate replacements

After all replacements:

1. **Check for remaining placeholders:**
   - Search all files for any remaining `{` and `}` patterns
   - If found, report them to the user

2. **Verify syntax:**
   - Ensure JS/TS files still have valid syntax
   - Ensure CSS files still have valid syntax
   - Report any syntax errors

3. **Log replacements:**
   - Count total replacements made
   - List files that were modified
   - Save this information for the final summary

If validation fails:
> ERROR: Placeholder replacement failed validation.
> - Files with remaining placeholders: [list]
> - Syntax errors found: [list]
>
> Please review these issues before continuing.

Stop and ask user how to proceed.

---

# 5. COPY JS/TS FILES INTO THE TARGET PROJECT

From the root of this extracted block folder:

- Identify all `.js` and `.ts` files (look for files with `.js`, `.ts`, `.jsx`, `.tsx` extensions).
- **These files should now have real names (no placeholders) after Step 4.**

Copy them to **this block's specific folder** within the `Blocks/` structure:

- **Standalone block:**  
  Create folder: `Blocks/TARGET_BLOCK_NAME/`  
  Copy JS/TS files into: `Blocks/TARGET_BLOCK_NAME/`
  Example: `Blocks/my-custom-header/my-custom-header.js`

- **Parent/Child pattern:**  
  Create folders: `Blocks/PARENT_BLOCK_NAME/` and `Blocks/CHILD_BLOCK_NAME/`  
  Copy parent JS files into: `Blocks/PARENT_BLOCK_NAME/`  
  Copy child JS files into: `Blocks/CHILD_BLOCK_NAME/`
  Example: `Blocks/product-carousel/product-carousel.js` and `Blocks/product-card/product-card.js`

**Important:** 
- All placeholders should already be replaced with actual names from Step 4
- Only copy files for THIS specific block
- Do not modify or copy files from other blocks

If missing utilities exist, list them in the final report instead of inventing them.

---

# 6. COPY CSS/SCSS FILES INTO THE TARGET PROJECT

From the root of this extracted block folder:

- Identify all `.css` / `.scss` files (look for files with `.css`, `.scss`, `.sass` extensions).
- **These files should now have real names and real CSS classes (no placeholders) after Step 4.**

Copy them to **this block's specific folder** within the `Blocks/` structure:

  - **Standalone block:**  
    Copy CSS files into: `Blocks/TARGET_BLOCK_NAME/`  
    Example: `Blocks/my-custom-header/my-custom-header.css`
  
  - **Parent/Child pattern:**  
    Copy parent CSS into: `Blocks/PARENT_BLOCK_NAME/`  
    Copy child CSS into: `Blocks/CHILD_BLOCK_NAME/`  
    Example: `Blocks/product-carousel/product-carousel.css` and `Blocks/product-card/product-card.css`

**Important:** 
- All placeholders should already be replaced with actual names and CSS classes from Step 4
- Only copy CSS files for THIS specific block
- Do not modify or copy files from other blocks

If the project uses a central SCSS importer, mention it in the summary for manual update.

---

# 7. REGISTER MODEL / CONFIG FILES

From the root of this extracted block folder:

- Identify all `.json` files (look for files with `.json` extension).
- **These files should now have real block names (no placeholders) after Step 4.**
- Merge block models into the project's main config at:  
  `GLOBAL_MODEL_PATH` (typically `/models/_section.json` or similar)

Behavior:

- If global file is an array → append block definition
- If global file is an object → add new keys
- Maintain formatting
- Follow naming conventions used by other blocks
- Use block names that match the folder names in `Blocks/`

**Note:** The block paths in the JSON should reference:
- `Blocks/TARGET_BLOCK_NAME` for single blocks
- `Blocks/PARENT_BLOCK_NAME` and `Blocks/CHILD_BLOCK_NAME` for parent/child blocks

If unclear, ask the user to confirm how the JSON should be structured.

---

# 8. UPDATE BLOCK INDEX / ROUTER (OPTIONAL)

If `BLOCK_INDEX_PATH` exists:

- Add imports for the new block(s) using the actual block names from Step 4
- Add export or routing entries following existing patterns

If index file does not exist → mention this in summary (not an error).

---

# 9. SANITY CHECKS

After copying and wiring:

- Check for remaining placeholders (any `{BLOCK_NAME}`, `{BLOCK_CLASS}`, etc.)
- Report unresolved imports  
- Check for any syntax errors in copied files
- Verify all file paths are correct and files exist

---

# 10. RUN TESTS (IF NO ISSUES FOUND)

If all sanity checks pass and no critical issues were found during implementation, run the following tests:

## 8.1 Build/Compile Test

Run the project's build command to ensure no compilation errors:

```bash
# Common EDS/AEM build commands (run the appropriate one for this project)
npm run build
# or
npm run lint
# or
aem up
```

If build fails:
- Report the exact error
- Identify which file is causing the issue
- Suggest fixes but do not modify without user confirmation

## 10.2 Development Server Test (Optional)

If the build succeeds, offer to start the development server:

```bash
# Common dev server commands
npm run dev
# or
npm start
# or
aem up
```

Then inform the user:

> Development server started successfully.
> You can now test the block at: [provide URL if known, typically http://localhost:3000]
>
> To test the block:
> 1. Navigate to a page that uses this block
> 2. Verify the block renders correctly
> 3. Check browser console for any errors
> 4. Test responsive behavior

## 10.3 Linting Test

Run linting to check code quality:

```bash
npm run lint
# or
npm run lint:fix  # to auto-fix issues
```

Report any linting errors or warnings found.

---

# 11. CLEANUP - DELETE TEMPORARY EXTRACTION FOLDER

**ONLY proceed with cleanup if:**
- All tests passed successfully (build, linting)
- Block is confirmed working in the target repository
- User confirms they are ready to clean up

Before deleting, ask the user for confirmation:

> All implementation steps completed successfully!
>
> The block has been integrated into your project at:
> - `Blocks/TARGET_BLOCK_NAME/` (with all JS, CSS files)
> - Models registered in: `GLOBAL_MODEL_PATH`
>
> **Ready to clean up?**
> 
> I can now delete the temporary extraction folder:
> - `_block-export/[BLOCK_FOLDER_NAME]/`
> 
> This will remove:
> - All extracted files (JS, CSS, JSON, docs)
> - `extraction-information.md`
> - `summary.md`
> - This `IMPLEMENTATION.md` file itself
>
> The block will remain fully functional in `Blocks/TARGET_BLOCK_NAME/`.
>
> **Should I proceed with cleanup?** (yes/no)

Wait for user confirmation.

## 11.1 If User Confirms Cleanup

Delete the entire `_block-export/[BLOCK_FOLDER_NAME]/` directory:

```bash
# Example command (adjust path based on actual location)
rm -rf _block-export/[BLOCK_FOLDER_NAME]
```

**After deletion, inform the user:**

> ✅ Cleanup completed successfully.
>
> **Deleted:**
> - `_block-export/[BLOCK_FOLDER_NAME]/` (entire folder including naming-map.json)
>
> **Preserved:**
> - `Blocks/TARGET_BLOCK_NAME/` - Your block is live here with your chosen names
> - `GLOBAL_MODEL_PATH` - Models registered
> - All project files intact
>
> The block is now fully integrated and the temporary files have been removed.

## 11.2 If User Declines Cleanup

> No problem! The temporary folder will remain at:
> - `_block-export/[BLOCK_FOLDER_NAME]/`
>
> You can delete it manually later when ready, or keep it for reference.
> The block is already fully functional in `Blocks/TARGET_BLOCK_NAME/`.

---

# 12. FINAL SUMMARY TO USER

After all steps (including tests and cleanup), respond with something like:

> Implementation completed.  
>
> **Block Names:**  
> - Original source name: [SOURCE_BLOCK_NAME from naming-map.json]
> - Implemented as: [TARGET_BLOCK_NAME or PARENT/CHILD names]  
>
> **Naming Replacements:**
> - Total placeholders replaced: [count]
> - File names updated: [list]
> - CSS classes renamed: [examples]
> - JS functions renamed: [examples]
>
> **Files Created:**  
> - JS files in: `Blocks/[block-name]/` - [list files]  
> - CSS files in: `Blocks/[block-name]/` - [list files]  
> - JSON/Model entries updated in: `GLOBAL_MODEL_PATH`
>
> **Files Modified:**  
> - `GLOBAL_MODEL_PATH` (model/config registration)
> - `BLOCK_INDEX_PATH` (if block index was updated)  
>
> **Standard Structure Used:**  
> - All block files placed in: `Blocks/TARGET_BLOCK_NAME/` (or `Blocks/PARENT_BLOCK_NAME/` and `Blocks/CHILD_BLOCK_NAME/`)
>
> **Test Results:**  
> - Build: ✅ Passed / ❌ Failed (with details)
> - Linting: ✅ Passed / ⚠️ Warnings (with details)
> - Dev Server: ✅ Started / ⏭️ Skipped
>
> **Cleanup:**  
> - Temporary extraction folder: ✅ Deleted / ⏭️ Kept (user choice)
>
> **Potential TODOs:**  
> - Verify design visually in the browser
> - Ensure missing utilities are implemented  
> - Add CSS imports if required by project convention  
> - Test block functionality and responsive behavior
> - Check accessibility compliance
>
> Let me know if you want me to create a test page or need help debugging any issues.

If any step cannot proceed → stop, explain, ask for clarification.

---
