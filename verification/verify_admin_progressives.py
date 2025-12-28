#!/usr/bin/env python3
"""
Admin Progressive Features Verification

Tests the complete progressive jackpot admin workflow:
- Admin login functionality
- Progressive editor (Bingo Babes and Hornet)
- W-2G calculator integration
- Public display verification

Production-ready with comprehensive assertions and error handling.

Usage: python3 verify_admin_progressives.py
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright, expect, TimeoutError

BASE_URL = "http://localhost:3001"
SCREENSHOT_DIR = "verification"

# Test credentials (from copilot-instructions.md: default admin is admin/admin123)
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

class AdminProgressiveTest:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.passed = 0
        self.failed = 0
        self.screenshots = []

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
            self.screenshots.append(filepath)
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

    def test_admin_login(self) -> bool:
        """Test admin login flow."""
        print("\n📋 TEST: Admin Login Flow")
        try:
            # Navigate to login
            self.page.goto(f"{BASE_URL}/admin/login", wait_until="networkidle", timeout=10000)
            
            # Verify login form exists
            username_input = self.page.locator("input[name='username']")
            password_input = self.page.locator("input[name='password']")
            submit_button = self.page.locator("button[type='submit']")
            
            assert username_input.count() > 0, "Username input not found"
            assert password_input.count() > 0, "Password input not found"
            assert submit_button.count() > 0, "Submit button not found"
            self.log_test("Login form loaded", True)
            
            # Fill and submit login form
            username_input.fill(TEST_USERNAME)
            password_input.fill(TEST_PASSWORD)
            submit_button.click()
            
            # Wait for redirect to dashboard
            try:
                expect(self.page).to_have_url(f"{BASE_URL}/admin", timeout=10000)
                self.log_test("Login successful and redirected", True)
                return True
            except:
                self.log_test("Login successful and redirected", False, 
                             f"Current URL: {self.page.url}")
                self.save_screenshot("login_fail")
                return False
                
        except Exception as e:
            self.log_test("Admin login", False, str(e))
            self.save_screenshot("login_error")
            return False

    def test_admin_dashboard_loaded(self) -> bool:
        """Test that admin dashboard loads correctly."""
        print("\n📋 TEST: Admin Dashboard")
        try:
            # Verify we're on admin page
            assert self.page.url == f"{BASE_URL}/admin", f"Wrong URL: {self.page.url}"
            
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
                progressives_tab = self.page.get_by_role("button", name="Progressives")
                expect(progressives_tab).to_be_visible(timeout=5000)
                self.log_test("Progressives tab visible", True)
                return True
            except:
                self.log_test("Progressives tab visible", False)
                self.save_screenshot("dashboard_no_tabs")
                return False
                
        except Exception as e:
            self.log_test("Admin dashboard", False, str(e))
            self.save_screenshot("dashboard_error")
            return False

    def test_progressives_tab(self) -> bool:
        """Test progressives editor tab."""
        print("\n📋 TEST: Progressives Tab")
        try:
            # Click progressives tab
            progressives_tab = self.page.get_by_role("button", name="Progressives")
            progressives_tab.click()
            
            # Wait for tab content
            self.page.wait_for_timeout(500)
            
            # Verify Bingo Babes section
            try:
                expect(self.page.locator("text=Bingo Babes")).to_be_visible(timeout=5000)
                self.log_test("Bingo Babes section visible", True)
            except:
                self.log_test("Bingo Babes section visible", False)
                self.save_screenshot("progressives_no_babes")
                return False
            
            # Verify Daytime (4 PM) label
            try:
                expect(self.page.locator("text=Daytime (4 PM)")).to_be_visible(timeout=5000)
                self.log_test("Daytime (4 PM) label visible", True)
            except:
                self.log_test("Daytime (4 PM) label visible", False)
                return False
            
            # Verify Hornet section
            try:
                expect(self.page.locator("text=Hornet")).to_be_visible(timeout=5000)
                self.log_test("Hornet section visible", True)
            except:
                self.log_test("Hornet section visible", False)
                self.save_screenshot("progressives_no_hornet")
                return False
            
            # Verify Session label
            try:
                session_label = self.page.locator("text=Session")
                assert session_label.count() > 0, "Session label not found"
                self.log_test("Session label visible", True)
            except:
                self.log_test("Session label visible", False)
                return False
            
            self.save_screenshot("progressives_tab")
            return True
            
        except Exception as e:
            self.log_test("Progressives tab", False, str(e))
            self.save_screenshot("progressives_error")
            return False

    def test_w2g_calculator(self) -> bool:
        """Test W-2G calculator component."""
        print("\n📋 TEST: W-2G Calculator")
        try:
            # Verify W-2G section is visible on progressives tab
            try:
                expect(self.page.locator("text=W-2G Payout Calculator")).to_be_visible(timeout=5000)
                self.log_test("W-2G Payout Calculator visible", True)
            except:
                self.log_test("W-2G Payout Calculator visible", False)
                self.save_screenshot("w2g_not_visible")
                return False
            
            # Check for Generate & Print button
            try:
                generate_btn = self.page.locator("text=Generate & Print W-2G")
                expect(generate_btn).to_be_visible(timeout=5000)
                self.log_test("Generate & Print button visible", True)
                return True
            except:
                self.log_test("Generate & Print button visible", False)
                return False
                
        except Exception as e:
            self.log_test("W-2G Calculator", False, str(e))
            return False

    def test_public_progressive_display(self) -> bool:
        """Test that progressives display on public homepage."""
        print("\n📋 TEST: Public Progressive Display")
        try:
            # Navigate to public homepage
            self.page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=10000)
            
            # Wait for animations and content
            self.page.wait_for_timeout(2000)
            
            # Check for DailySpecials section (contains progressives)
            try:
                expect(self.page.locator("text=Daily Specials")).to_be_visible(timeout=5000)
                self.log_test("Daily Specials section visible", True)
            except:
                self.log_test("Daily Specials section visible", False)
                self.save_screenshot("public_no_dailyspecials")
                return False
            
            # The homepage shows progressive info in DailySpecials component
            self.save_screenshot("public_home_progressives")
            return True
            
        except Exception as e:
            self.log_test("Public progressive display", False, str(e))
            self.save_screenshot("public_error")
            return False

    def run(self):
        """Run all tests."""
        print("=" * 70)
        print("ADMIN PROGRESSIVES VERIFICATION SUITE")
        print("=" * 70)
        
        if not self.setup():
            return 1
        
        try:
            # Run tests in sequence
            all_passed = True
            all_passed = self.test_admin_login() and all_passed
            all_passed = self.test_admin_dashboard_loaded() and all_passed
            all_passed = self.test_progressives_tab() and all_passed
            all_passed = self.test_w2g_calculator() and all_passed
            all_passed = self.test_public_progressive_display() and all_passed
            
            # Print summary
            print("\n" + "=" * 70)
            print("TEST SUMMARY")
            print("=" * 70)
            print(f"✅ Passed: {self.passed}")
            print(f"❌ Failed: {self.failed}")
            print(f"Total:   {self.passed + self.failed}")
            
            if self.screenshots:
                print(f"\n📸 Screenshots saved:")
                for screenshot in self.screenshots:
                    print(f"   • {screenshot}")
            
            print("\n" + "=" * 70)
            
            if all_passed and self.failed == 0:
                print("✅ ALL TESTS PASSED")
                return 0
            else:
                print(f"❌ {self.failed} TEST(S) FAILED")
                return 1
                
        finally:
            self.teardown()

if __name__ == "__main__":
    test = AdminProgressiveTest()
    exit_code = test.run()
    sys.exit(exit_code)
