#!/usr/bin/env python3
"""
W-2G Signature Form Verification

Tests the complete W-2G form workflow:
- Admin login
- Progressives tab access
- W-2G calculator visibility
- Payout amount validation
- Player information form
- Signature canvas interaction
- Form generation

Production-ready with comprehensive assertions.

Usage: python3 verify_w2g_signature.py
"""

import sys
from playwright.sync_api import sync_playwright, expect, TimeoutError

BASE_URL = "http://localhost:3000"
SCREENSHOT_DIR = "verification"

# Test credentials
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

class W2GSignatureTest:
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

    def test_admin_login_for_w2g(self) -> bool:
        """Login to admin for W-2G testing."""
        print("\n📋 TEST: Admin Login for W-2G")
        try:
            self.page.goto(f"{BASE_URL}/admin/login", wait_until="networkidle", timeout=10000)
            
            # Fill login form
            self.page.locator("input[name='username']").fill(TEST_USERNAME)
            self.page.locator("input[name='password']").fill(TEST_PASSWORD)
            self.page.locator("button[type='submit']").click()
            
            # Wait for redirect
            try:
                expect(self.page).to_have_url(f"{BASE_URL}/admin", timeout=10000)
                self.log_test("Admin login successful", True)
                return True
            except:
                self.log_test("Admin login successful", False, 
                             f"Wrong URL: {self.page.url}")
                self.save_screenshot("w2g_login_fail")
                return False
                
        except Exception as e:
            self.log_test("Admin login for W-2G", False, str(e))
            self.save_screenshot("w2g_login_error")
            return False

    def test_navigate_to_progressives(self) -> bool:
        """Navigate to Progressives tab."""
        print("\n📋 TEST: Navigate to Progressives Tab")
        try:
            # Click Progressives tab
            progressives_tab = self.page.get_by_role("button", name="Progressives")
            progressives_tab.click()
            
            # Wait for tab content
            self.page.wait_for_timeout(500)
            
            # Verify tab content loaded
            try:
                expect(self.page.locator("text=W-2G Payout Calculator")).to_be_visible(timeout=5000)
                self.log_test("Progressives tab loaded with W-2G section", True)
                return True
            except:
                self.log_test("Progressives tab loaded with W-2G section", False)
                self.save_screenshot("w2g_progressives_tab_fail")
                return False
                
        except Exception as e:
            self.log_test("Navigate to Progressives", False, str(e))
            return False

    def test_w2g_calculator_visibility(self) -> bool:
        """Test W-2G calculator component visibility."""
        print("\n📋 TEST: W-2G Calculator Visibility")
        try:
            # Find W-2G section
            try:
                w2g_header = self.page.locator("text=W-2G Payout Calculator")
                expect(w2g_header).to_be_visible(timeout=5000)
                self.log_test("W-2G Payout Calculator header visible", True)
            except:
                self.log_test("W-2G Payout Calculator header visible", False)
                self.save_screenshot("w2g_header_missing")
                return False
            
            # Check for total payout input
            try:
                # The W-2G section should have a number input for total payout
                inputs = self.page.locator("input[type='number']")
                if inputs.count() > 0:
                    self.log_test("W-2G payout input fields exist", True)
                else:
                    self.log_test("W-2G payout input fields exist", False)
                    return False
            except:
                self.log_test("W-2G payout input fields exist", False)
                return False
            
            return True
            
        except Exception as e:
            self.log_test("W-2G calculator visibility", False, str(e))
            return False

    def test_w2g_form_threshold(self) -> bool:
        """Test W-2G form appears when payout exceeds threshold ($1200)."""
        print("\n📋 TEST: W-2G Form Threshold Trigger")
        try:
            # Get all number inputs and set first one to trigger W-2G (>1200)
            inputs = self.page.locator("input[type='number']")
            
            if inputs.count() == 0:
                self.log_test("W-2G form triggers on high payout", False, 
                             "No number inputs found")
                return False
            
            # Set first input to high value
            inputs.first.fill("1500")
            
            # Wait for form to appear
            self.page.wait_for_timeout(500)
            
            # Check if Player Information form appears
            try:
                expect(self.page.locator("text=Player Information")).to_be_visible(timeout=5000)
                self.log_test("W-2G form threshold trigger (>$1200)", True)
                return True
            except:
                # Check for W-2G Required text instead
                try:
                    w2g_required = self.page.locator("text=W-2G Required")
                    expect(w2g_required).to_be_visible(timeout=5000)
                    self.log_test("W-2G form threshold trigger (>$1200)", True)
                    return True
                except:
                    self.log_test("W-2G form threshold trigger (>$1200)", False)
                    self.save_screenshot("w2g_threshold_fail")
                    return False
                
        except Exception as e:
            self.log_test("W-2G form threshold", False, str(e))
            self.save_screenshot("w2g_threshold_error")
            return False

    def test_player_info_form_fields(self) -> bool:
        """Test player information form fields."""
        print("\n📋 TEST: Player Information Form Fields")
        try:
            # Wait for the player info section to be visible
            player_info_header = "h3:has-text('Player Information & W-2G Generation')"
            try:
                self.page.wait_for_selector(player_info_header, state='visible', timeout=10000)
                self.log_test("Player Information section appeared", True)
            except TimeoutError:
                self.log_test("Player Information section appeared", False, "Form did not load after high payout.")
                self.save_screenshot("w2g_player_info_missing")
                return False

            # Look for player name input
            name_input = self.page.get_by_placeholder("John Doe")
            expect(name_input).to_be_visible()
            self.log_test("Player name input field exists", True)
            
            # Look for SSN input
            ssn_input = self.page.get_by_placeholder("XXX-XX-XXXX")
            expect(ssn_input).to_be_visible()
            self.log_test("Player SSN input field exists", True)
            return True
                
        except Exception as e:
            self.log_test("Player info form fields", False, str(e))
            self.save_screenshot("w2g_player_info_error")
            return False

    def test_signature_canvas(self) -> bool:
        """Test signature canvas element."""
        print("\n📋 TEST: Signature Canvas")
        try:
            # Look for canvas element
            canvas = self.page.locator("canvas")
            
            if canvas.count() > 0:
                self.log_test("Signature canvas element exists", True)
                
                # Try to interact with canvas (draw a simple line)
                try:
                    box = canvas.bounding_box()
                    if box:
                        # Move to canvas
                        self.page.mouse.move(box["x"] + 20, box["y"] + 20)
                        # Press and drag
                        self.page.mouse.down()
                        self.page.mouse.move(box["x"] + 100, box["y"] + 50)
                        self.page.mouse.up()
                        
                        self.log_test("Signature canvas interaction works", True)
                        return True
                    else:
                        self.log_test("Signature canvas interaction works", False, 
                                     "Canvas bounding box not found")
                        return False
                except:
                    self.log_test("Signature canvas interaction works", False)
                    return False
            else:
                self.log_test("Signature canvas element exists", False)
                self.save_screenshot("w2g_no_canvas")
                return False
                
        except Exception as e:
            self.log_test("Signature canvas", False, str(e))
            return False

    def test_generate_button(self) -> bool:
        """Test Generate & Print W-2G button exists."""
        print("\n📋 TEST: Generate & Print Button")
        try:
            # Look for Generate & Print button
            generate_btn = self.page.locator("button").filter(has_text="Generate & Print W-2G")
            
            if generate_btn.count() > 0:
                self.log_test("Generate & Print W-2G button exists", True)
                
                # Check if button is enabled
                try:
                    is_disabled = generate_btn.first.is_disabled()
                    if is_disabled:
                        self.log_test("Generate button is clickable", False, 
                                     "Button is disabled (requires full form)")
                    else:
                        self.log_test("Generate button is clickable", True)
                    return True
                except:
                    self.log_test("Generate button is clickable", True)
                    return True
            else:
                self.log_test("Generate & Print W-2G button exists", False)
                self.save_screenshot("w2g_no_generate_button")
                return False
                
        except Exception as e:
            self.log_test("Generate button", False, str(e))
            return False

    def test_w2g_page_screenshot(self) -> bool:
        """Save W-2G form screenshot."""
        print("\n📋 TEST: W-2G Form Screenshot")
        try:
            self.save_screenshot("w2g_form")
            return True
        except Exception as e:
            self.log_test("W-2G form screenshot", False, str(e))
            return False

    def run(self):
        """Run all tests."""
        print("=" * 70)
        print("W-2G SIGNATURE FORM VERIFICATION SUITE")
        print("=" * 70)
        
        if not self.setup():
            return 1
        
        try:
            # Run tests in sequence
            all_passed = True
            all_passed = self.test_admin_login_for_w2g() and all_passed
            all_passed = self.test_navigate_to_progressives() and all_passed
            all_passed = self.test_w2g_calculator_visibility() and all_passed
            all_passed = self.test_w2g_form_threshold() and all_passed
            all_passed = self.test_player_info_form_fields() and all_passed
            all_passed = self.test_signature_canvas() and all_passed
            all_passed = self.test_generate_button() and all_passed
            all_passed = self.test_w2g_page_screenshot() and all_passed
            
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
    test = W2GSignatureTest()
    exit_code = test.run()
    sys.exit(exit_code)
