#!/usr/bin/env python3
"""
Admin Users Management Verification

Tests the complete user management workflow:
- Admin login
- Users tab navigation
- User creation form
- Default admin credentials
- User listing in table

Production-ready with comprehensive assertions.

Usage: python3 verify_admin.py
"""

import sys
import time
from playwright.sync_api import sync_playwright, expect, TimeoutError

BASE_URL = "http://localhost:3001"
SCREENSHOT_DIR = "verification"

# Test credentials (from copilot-instructions.md)
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# Test user to create
TEST_USER = {
    "username": f"test_caller_{int(time.time())}",  # Unique per test run
    "password": "TestPassword123!",
    "role": "mic"
}

class AdminUsersTest:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.passed = 0
        self.failed = 0

    def log_test(self, test_name: str, passed: bool, message: str = ""):
        """Log test result."""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"       {message}")
        
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def save_screenshot(self, name: str):
        """Save screenshot for debugging."""
        try:
            filepath = f"{SCREENSHOT_DIR}/{name}.png"
            self.page.screenshot(path=filepath, full_page=True)
            print(f"     📸 Screenshot: {filepath}")
            return True
        except Exception as e:
            print(f"     ✗ Screenshot failed: {str(e)}")
            return False

    def setup(self):
        """Initialize browser and context."""
        try:
            playwright = sync_playwright().start()
            self.browser = playwright.chromium.launch(headless=True)
            self.context = self.browser.new_context()
            self.page = self.context.new_page()
            print("✅ Browser initialized")
            return True
        except Exception as e:
            print(f"❌ Browser initialization failed: {str(e)}")
            return False

    def teardown(self):
        """Close browser and cleanup."""
        try:
            if self.page:
                self.page.close()
            if self.context:
                self.context.close()
            if self.browser:
                self.browser.close()
            print("✅ Browser closed")
        except Exception as e:
            print(f"⚠️  Cleanup error: {str(e)}")

    def test_login_page_loads(self) -> bool:
        """Test that admin login page loads."""
        print("\n📋 TEST: Admin Login Page Load")
        try:
            self.page.goto(f"{BASE_URL}/admin/login", wait_until="networkidle", timeout=10000)
            
            # Check for login form
            form = self.page.locator("form")
            if form.count() > 0:
                self.log_test("Login form loaded", True)
                return True
            else:
                self.log_test("Login form loaded", False)
                self.save_screenshot("login_no_form")
                return False
                
        except Exception as e:
            self.log_test("Login page loads", False, str(e))
            self.save_screenshot("login_error")
            return False

    def test_admin_login(self) -> bool:
        """Test admin login with default credentials."""
        print("\n📋 TEST: Admin Login")
        try:
            # Fill login form
            self.page.locator("input[name='username']").fill(TEST_USERNAME)
            self.page.locator("input[name='password']").fill(TEST_PASSWORD)
            
            # Submit
            self.page.locator("button[type='submit']").click()
            
            # Wait for redirect to admin dashboard
            try:
                expect(self.page).to_have_url(f"{BASE_URL}/admin", timeout=10000)
                self.log_test("Admin login successful", True)
                return True
            except:
                self.log_test("Admin login successful", False, 
                             f"Wrong URL: {self.page.url}")
                self.save_screenshot("login_redirect_fail")
                return False
                
        except Exception as e:
            self.log_test("Admin login", False, str(e))
            self.save_screenshot("login_fail")
            return False

    def test_dashboard_loads(self) -> bool:
        """Test that admin dashboard loads."""
        print("\n📋 TEST: Admin Dashboard Load")
        try:
            # Wait for dashboard to load
            self.page.wait_for_timeout(1500)
            
            # Check for Management Console header
            try:
                expect(self.page.locator("text=Management Console")).to_be_visible(timeout=5000)
                self.log_test("Management Console header visible", True)
            except:
                self.log_test("Management Console header visible", False)
                self.save_screenshot("dashboard_no_header")
                return False
            
            # Check for tab buttons
            try:
                users_tab = self.page.get_by_role("button", name="Users")
                expect(users_tab).to_be_visible(timeout=5000)
                self.log_test("Users tab visible", True)
                return True
            except:
                self.log_test("Users tab visible", False)
                self.save_screenshot("dashboard_no_users_tab")
                return False
                
        except Exception as e:
            self.log_test("Dashboard loads", False, str(e))
            self.save_screenshot("dashboard_error")
            return False

    def test_users_tab(self) -> bool:
        """Test users tab content."""
        print("\n📋 TEST: Users Tab")
        try:
            # Click Users tab
            users_tab = self.page.get_by_role("button", name="Users")
            users_tab.click()
            
            # Wait for tab content
            self.page.wait_for_timeout(500)
            
            # Check for users table
            try:
                table = self.page.locator("table")
                expect(table).to_be_visible(timeout=5000)
                self.log_test("Users table visible", True)
            except:
                self.log_test("Users table visible", False)
                self.save_screenshot("users_no_table")
                return False
            
            # Check for default admin user in table
            try:
                admin_user = self.page.locator("text=admin")
                if admin_user.count() > 0:
                    self.log_test("Default admin user in table", True)
                else:
                    self.log_test("Default admin user in table", False, 
                                 "Admin user not found in table")
                    return False
            except:
                self.log_test("Default admin user in table", False)
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Users tab", False, str(e))
            self.save_screenshot("users_tab_error")
            return False

    def test_user_creation_form(self) -> bool:
        """Test that user creation form exists."""
        print("\n📋 TEST: User Creation Form")
        try:
            # Look for user creation form (should be in Users tab)
            forms = self.page.locator("form")
            if forms.count() > 0:
                self.log_test("User creation form visible", True)
                
                # Check for required inputs
                inputs = self.page.locator("input")
                if inputs.count() >= 2:  # At least username and password
                    self.log_test("Form inputs present", True)
                else:
                    self.log_test("Form inputs present", False, 
                                 f"Found {inputs.count()} inputs, expected >= 2")
                    return False
                
                # Check for role select/dropdown
                selects = self.page.locator("select")
                if selects.count() > 0:
                    self.log_test("Role selector present", True)
                    return True
                else:
                    self.log_test("Role selector present", False)
                    self.save_screenshot("users_form_no_select")
                    return False
            else:
                self.log_test("User creation form visible", False)
                self.save_screenshot("users_no_form")
                return False
                
        except Exception as e:
            self.log_test("User creation form", False, str(e))
            return False

    def test_create_new_user(self) -> bool:
        """Test creating a new user."""
        print("\n📋 TEST: Create New User")
        try:
            # Fill username
            username_inputs = self.page.locator("input[type='text']")
            if username_inputs.count() > 0:
                username_inputs.first.fill(TEST_USER["username"])
                self.log_test("Username entered", True)
            else:
                self.log_test("Username entered", False, "Username input not found")
                return False
            
            # Fill password
            password_inputs = self.page.locator("input[type='password']")
            if password_inputs.count() > 0:
                password_inputs.first.fill(TEST_USER["password"])
                self.log_test("Password entered", True)
            else:
                self.log_test("Password entered", False, "Password input not found")
                return False
            
            # Select role
            select = self.page.locator("select")
            if select.count() > 0:
                select.first.select_option(TEST_USER["role"])
                self.log_test("Role selected", True)
            else:
                self.log_test("Role selected", False, "Role select not found")
                return False
            
            # Click create button
            create_btn = self.page.locator("button").filter(has_text="Create")
            if create_btn.count() > 0:
                create_btn.first.click()
                self.page.wait_for_timeout(1000)  # Wait for creation
                
                self.log_test("Create button clicked", True)
                
                # Verify user appears in table
                try:
                    user_row = self.page.locator(f"text={TEST_USER['username']}")
                    if user_row.count() > 0:
                        self.log_test("New user appears in table", True)
                        return True
                    else:
                        self.log_test("New user appears in table", False)
                        self.save_screenshot("users_create_no_appearance")
                        return False
                except:
                    self.log_test("New user appears in table", False)
                    return False
            else:
                self.log_test("Create button clicked", False, "Create button not found")
                return False
                
        except Exception as e:
            self.log_test("Create new user", False, str(e))
            self.save_screenshot("users_create_error")
            return False

    def test_dashboard_screenshot(self) -> bool:
        """Save admin dashboard screenshot."""
        print("\n📋 TEST: Admin Dashboard Screenshot")
        try:
            self.save_screenshot("admin_dashboard")
            return True
        except Exception as e:
            self.log_test("Dashboard screenshot", False, str(e))
            return False

    def run(self):
        """Run all tests."""
        print("=" * 70)
        print("ADMIN USERS MANAGEMENT VERIFICATION SUITE")
        print("=" * 70)
        
        if not self.setup():
            return 1
        
        try:
            # Run tests in sequence
            all_passed = True
            all_passed = self.test_login_page_loads() and all_passed
            all_passed = self.test_admin_login() and all_passed
            all_passed = self.test_dashboard_loads() and all_passed
            all_passed = self.test_users_tab() and all_passed
            all_passed = self.test_user_creation_form() and all_passed
            all_passed = self.test_create_new_user() and all_passed
            all_passed = self.test_dashboard_screenshot() and all_passed
            
            # Print summary
            print("\n" + "=" * 70)
            print("TEST SUMMARY")
            print("=" * 70)
            print(f"✅ Passed: {self.passed}")
            print(f"❌ Failed: {self.failed}")
            print(f"Total:   {self.passed + self.failed}")
            print("=" * 70)
            
            if all_passed and self.failed == 0:
                print("✅ ALL TESTS PASSED")
                return 0
            else:
                print(f"❌ {self.failed} TEST(S) FAILED")
                return 1
                
        finally:
            self.teardown()

if __name__ == "__main__":
    test = AdminUsersTest()
    exit_code = test.run()
    sys.exit(exit_code)
