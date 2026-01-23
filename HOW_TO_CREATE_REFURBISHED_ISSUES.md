# How to Create Refurbished Roadmap Issues

This guide explains how to use the refurbished roadmap issue templates to create GitHub issues for VEXEL technical debt and production readiness.

## Quick Overview

We've created **22 comprehensive issue templates** covering:
- **P0 (Critical):** 5 issues - Build/Package Correctness & CI
- **P1 (High):** 11 issues - Security & API/Dashboard + Wallet Security
- **P2 (Medium):** 6 issues - HAAP, Contracts, Documentation

## Files Created

1. **`REFURBISHED_ROADMAP_ISSUES.md`** - Full issue templates (1,794 lines)
   - Complete markdown content for all 22 issues
   - Copy-paste ready for manual issue creation
   - Includes tasks, acceptance criteria, dependencies

2. **`REFURBISHED_ISSUES_SUMMARY.md`** - Quick reference (247 lines)
   - Overview of all 22 issues
   - Priority breakdown and implementation plan
   - Success metrics

3. **`scripts/create-refurbished-issues.sh`** - Automated creation script (1,054 lines)
   - Creates all 22 issues via GitHub CLI
   - Applies correct labels automatically
   - Single command execution

## Method 1: Automated Creation (Recommended)

### Prerequisites

1. **Install GitHub CLI** (if not already installed):
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   
   # Windows
   winget install --id GitHub.cli
   ```

2. **Authenticate with GitHub**:
   ```bash
   gh auth login
   ```
   - Select GitHub.com
   - Choose HTTPS or SSH
   - Authenticate via web browser or token

3. **Verify you have repository access**:
   ```bash
   gh repo view Violet-Site-Systems/VEXEL
   ```

### Run the Script

```bash
# From the repository root
cd /path/to/VEXEL

# Run the script
./scripts/create-refurbished-issues.sh
```

**What happens:**
1. Script verifies GitHub CLI is installed and authenticated
2. Creates all 22 issues in order (P0 → P1 → P2)
3. Applies correct labels to each issue
4. Shows progress as each issue is created
5. Displays summary when complete

**Time:** ~1-2 minutes for all 22 issues

### Expected Output

```
Creating 22 Refurbished Roadmap Issues...

Creating issue: [P0] Establish Build Boundaries for DB/IPFS/Knowledge-Base Modules
✓ Created

Creating issue: [P0] Document Multi-Package Repository Structure and Guidelines
✓ Created

...

============================================
✓ All 22 Refurbished Roadmap Issues Created!
============================================

Summary:
  - P0 (Critical): 5 issues
  - P1 (High): 11 issues
  - P2 (Medium): 6 issues
```

## Method 2: Manual Creation

If you prefer to create issues manually or want to customize them:

### Step-by-Step

1. **Open the template file**:
   ```bash
   cat REFURBISHED_ROADMAP_ISSUES.md
   ```

2. **Navigate to GitHub Issues**:
   - Go to https://github.com/Violet-Site-Systems/VEXEL/issues
   - Click "New Issue"

3. **For each issue**:
   - Copy the title from the template (e.g., `[P0] Establish Build Boundaries...`)
   - Copy the description markdown (everything under that issue's section)
   - Add labels as specified in the template
   - Submit the issue

4. **Repeat for all 22 issues**

**Time:** ~15-20 minutes for all 22 issues

### Tips for Manual Creation

- Keep the `REFURBISHED_ROADMAP_ISSUES.md` file open in a text editor
- Use split screen: browser on one side, template on the other
- Create issues in priority order (P0 first, then P1, then P2)
- Double-check labels match the template

## Method 3: Selective Creation

If you only want to create certain issues:

### Using the Script (Modified)

Edit `scripts/create-refurbished-issues.sh` and comment out issues you don't want:

```bash
# P0.1: Build Boundaries
# create_issue \
#     "[P0] Establish Build Boundaries..." \
#     "..." \
#     "P0,build,architecture,refactor"

# Keep only the issues you want
create_issue \
    "[P0] Align Jest and ts-jest Versions..." \
    "..." \
    "P0,testing,dependencies,build"
```

### Using Manual Method

Just create the specific issues you need from the template.

## Verifying Issues Were Created

### Check via GitHub Web

1. Go to https://github.com/Violet-Site-Systems/VEXEL/issues
2. Filter by labels (e.g., `label:P0`)
3. Verify all expected issues appear

### Check via GitHub CLI

```bash
# List all P0 issues
gh issue list --label P0

# List all issues with "refurbish" in title
gh issue list --search "refurbish"

# Get count of open issues
gh issue list --state open --limit 1000 | wc -l
```

## Next Steps After Creation

1. **Review Issues**: Scan through created issues for accuracy
2. **Set Up Project Board**: Create a project board to track progress
3. **Prioritize**: Assign issues to milestones or sprints
4. **Assign Owners**: Assign issues to team members
5. **Begin Implementation**: Start with P0 issues

### Recommended Implementation Order

**Week 1 - CI Foundation:**
- #R0.3 - Jest version alignment
- #R0.4 - GitHub Actions CI
- #R0.5 - Integration test workflow

**Week 2 - Security Hardening:**
- #R1.1 - WebSocket JWT auth
- #R1.2 - CORS configuration
- #R1.3 - Resource-scoped authorization
- #R1.4 - Production login hardening
- #R2.1 - Wallet encryption key
- #R2.2 - Mnemonic protection

**Week 3 - API & Dashboard:**
- #R1.5 - Agent CRUD API
- #R1.6 - API input validation
- #R1.7 - Swagger generation
- #R1.8 - Dashboard types
- #R1.9 - Dashboard security

**Week 4 - Build Architecture:**
- #R0.1 - Build boundaries
- #R0.2 - Multi-package docs

**Week 5 - Protocol & Docs:**
- #R3.1 - HAAP token ID
- #R3.2 - HAAP storage
- #R3.3 - Contract DID protection
- #R3.4 - Subgraph alignment
- #R3.5 - Documentation matrix
- #R3.6 - Examples alignment

## Troubleshooting

### "gh: command not found"

**Problem:** GitHub CLI is not installed

**Solution:** Install GitHub CLI:
```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Or download from: https://cli.github.com/
```

### "error: HTTP 401: Bad credentials"

**Problem:** Not authenticated with GitHub

**Solution:** Run authentication:
```bash
gh auth login
```

### "error: HTTP 403: Resource not accessible"

**Problem:** Insufficient repository permissions

**Solution:** 
- Verify you have write access to the repository
- Contact repository owner to grant access
- Or use a personal access token with `repo` scope

### "Script creates duplicate issues"

**Problem:** Script was run multiple times

**Solution:**
- Check existing issues first: `gh issue list`
- Close duplicate issues: `gh issue close <issue-number>`
- Prevent re-running the script

### Issues have wrong content

**Problem:** Template was modified incorrectly

**Solution:**
- Check the original `REFURBISHED_ROADMAP_ISSUES.md`
- Update incorrect issues manually
- Or close and recreate from template

## Additional Resources

- **Full Template:** `REFURBISHED_ROADMAP_ISSUES.md`
- **Quick Reference:** `REFURBISHED_ISSUES_SUMMARY.md`
- **GitHub CLI Docs:** https://cli.github.com/manual/
- **GitHub Issues Guide:** https://docs.github.com/en/issues

## Questions?

If you have questions or encounter issues not covered here:

1. Review the detailed templates in `REFURBISHED_ROADMAP_ISSUES.md`
2. Check the quick reference in `REFURBISHED_ISSUES_SUMMARY.md`
3. Consult GitHub CLI documentation: `gh issue create --help`
4. Open a discussion in the repository

---

**Last Updated:** 2026-01-23  
**Version:** 1.0
