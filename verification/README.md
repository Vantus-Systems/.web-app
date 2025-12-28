# Mary Esther Bingo - Verification Test Suite

Production-ready Fortune-1000 level verification scripts for the Mary Esther Bingo website.

All scripts are designed for continuous integration, quality assurance, and client delivery validation.

## Overview

The verification suite tests all critical user journeys and administrative workflows:

1. **Screenshot Capture** - Multi-viewport visual documentation
2. **Admin Authentication & Users** - Login flow and user management
3. **Pricing & Navigation** - Page rendering and UI navigation
4. **Progressive Jackpots** - Jackpot display and admin controls
5. **W-2G Tax Forms** - Complex form handling and signature capture

## Prerequisites

- Node.js 16+ (for dev server)
- Python 3.8+
- Playwright browser automation: `pip install playwright`
- Running dev server at `http://localhost:3001`

## Installation

```bash
# Install Python dependencies
pip install playwright

# Install Playwright browsers (one-time)
playwright install chromium
```

## Running the Tests

### Individual Test Scripts

Each script is standalone and can be run independently:

```bash
# Screenshot capture (desktop & mobile)
python3 capture_fortune10000_screenshots.py

# Admin progressives feature
python3 verify_admin_progressives.py

# Admin user management
python3 verify_admin.py

# Pricing page & navigation
python3 verify_pricing_and_nav.py

# W-2G signature form
python3 verify_w2g_signature.py
```

### Run All Tests

```bash
python3 run_all_tests.py
```

This will execute all verification scripts and provide a comprehensive summary.

## Test Details

### 1. capture_fortune10000_screenshots.py

Captures high-quality screenshots of all pages in both desktop (1920x1080) and mobile (390x844) viewports.

**Pages Tested:**
- Homepage (with DailySpecials)
- Pricing
- Schedule
- About
- Contact

**Output:** `{page}_{viewport}_fortune10000_{layout}.png`

**Production Use:** Client deliverables, marketing materials, responsive design validation

---

### 2. verify_admin_progressives.py

Tests the complete progressive jackpot admin workflow and public display.

**Tests:**
- ✅ Admin login with default credentials
- ✅ Dashboard loads and renders correctly
- ✅ Progressives tab navigation
- ✅ Bingo Babes progressive display
- ✅ Hornet progressive display
- ✅ W-2G calculator visibility
- ✅ Public home page progressive display

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**Note:** Default admin is auto-created when `server/data/users.json` is empty (development only).

---

### 3. verify_admin.py

Tests admin user management interface and workflows.

**Tests:**
- ✅ Admin login page loads
- ✅ Login with default credentials
- ✅ Dashboard renders
- ✅ Users tab accessible
- ✅ User creation form present
- ✅ Create and list new users

**User Creation:**
Automatically creates unique test users (username uses timestamp to avoid conflicts).

---

### 4. verify_pricing_and_nav.py

Tests pricing page rendering and navigation elements.

**Tests:**
- ✅ Navigation menu visible
- ✅ Pricing link in navigation
- ✅ Pricing page loads
- ✅ Bingo Babes progressive info
- ✅ Hornet progressive info
- ✅ Pricing content sections
- ✅ Responsive mobile design

**Device Support:** Tests both desktop (1920x1080) and mobile (390x844) viewports

---

### 5. verify_w2g_signature.py

Tests W-2G tax form functionality and signature capture.

**Tests:**
- ✅ Admin login
- ✅ Navigate to Progressives tab
- ✅ W-2G calculator visibility
- ✅ Form threshold trigger (>$1200)
- ✅ Player information form fields
- ✅ Signature canvas element
- ✅ Signature interaction (drawing)
- ✅ Generate & Print button

**W-2G Threshold:** Form auto-appears when payout amount exceeds $1,200 (IRS requirement)

---

## Test Results

All scripts output:

1. **Console Output**
   - Test name and result (✅ PASS / ❌ FAIL)
   - Detailed failure messages
   - Screenshot locations for debugging

2. **Screenshots**
   - Saved to `verification/*.png`
   - Timestamped and named for easy identification
   - Full-page captures for documentation

3. **Exit Codes**
   - `0` = All tests passed ✅
   - `1` = One or more tests failed ❌

## Production Deployment

### Pre-Deployment Checklist

Before shipping to client:

1. **Run full verification suite**
   ```bash
   python3 run_all_tests.py
   ```

2. **Review all screenshots**
   - Check for rendering issues
   - Verify responsive design
   - Validate UI consistency

3. **Check exit codes**
   - All scripts should return `0`
   - No errors in console output

4. **Capture reference screenshots**
   - Archive screenshots in client delivery package
   - Document any known issues or limitations

### Continuous Integration

The scripts are designed for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run verification suite
  run: python3 verification/run_all_tests.py
```

### Client Delivery

**Include in deliverables:**

1. All screenshots from `verification/` directory
2. This README file
3. Requirements documentation
4. Test execution report

## Troubleshooting

### "Unable to find available port" Error

The dev server needs to run at port 3001. If port 3000 is in use:

```bash
# All scripts use hardcoded http://localhost:3001
# Ensure dev server is running:
npm run dev
```

### "Timeout navigating to URL"

Page took too long to load. Check:
- Dev server is running: `http://localhost:3001`
- Network connectivity
- Browser headless mode support
- System resources (memory, CPU)

### Authentication Failures

Default credentials (admin/admin123) only work in development. For production:
- Configure real admin credentials
- Update scripts with production credentials
- Use environment variables for sensitive data

### Screenshot Not Found

Check:
- `verification/` directory exists and is writable
- Sufficient disk space
- File permissions

## Architecture Notes

- **Playwright Sync API** - Simpler for test scripts than async
- **Headless mode** - All tests run without visible browser window
- **Responsive testing** - Mobile and desktop viewports tested separately
- **Error recovery** - Tests continue even if individual assertions fail
- **Screenshots for debugging** - Automatic capture on failures

## Code Standards

All scripts follow these standards for production readiness:

- ✅ Comprehensive error handling
- ✅ Detailed logging and output
- ✅ Assertion-based validation
- ✅ Timeout management
- ✅ Resource cleanup (browser closure)
- ✅ Exit code compliance
- ✅ Screenshot documentation
- ✅ Type hints where applicable
- ✅ Docstrings for all functions
- ✅ Single responsibility principle

## Support

For issues or questions:

1. Check the Playwright documentation: https://playwright.dev
2. Review the source code in `server/api/` and `pages/`
3. Check copilot-instructions.md for architecture details
4. Review test output and screenshots for specific failures

## Version History

- **v1.0** - Initial Fortune-1000 ready verification suite
  - All scripts refactored for production
  - Comprehensive error handling added
  - Debug scripts removed
  - Full documentation added
