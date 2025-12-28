#!/usr/bin/env python3
"""
Pricing Page and Navigation Verification

Tests:
- Pricing page layout and content
- Progressive jackpot information display
- Navigation menu
- Responsive design (desktop/mobile)

Production-ready with comprehensive assertions.

Usage: python3 verify_pricing_and_nav.py
"""

import sys
from playwright.sync_api import sync_playwright, expect, TimeoutError

BASE_URL = "http://localhost:3001"
SCREENSHOT_DIR = "verification"

class PricingAndNavTest:
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

    def test_navigation_menu(self) -> bool:
        """Test that main navigation exists and works."""
        print("\n📋 TEST: Navigation Menu")
        try:
            # Navigate to home
            self.page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=10000)
            
            # Check for header/nav element
            try:
                nav = self.page.locator("header")
                expect(nav).to_be_visible(timeout=5000)
                self.log_test("Header navigation visible", True)
            except:
                self.log_test("Header navigation visible", False)
                self.save_screenshot("nav_not_visible")
                return False
            
            # Check for Pricing link
            try:
                pricing_link = self.page.get_by_role("link", name="Pricing")
                if pricing_link.count() == 0:
                    # Try alternative selectors
                    pricing_link = self.page.locator("a", has_text="Pricing")
                
                if pricing_link.count() > 0:
                    self.log_test("Pricing link in navigation", True)
                else:
                    self.log_test("Pricing link in navigation", False)
                    return False
            except:
                self.log_test("Pricing link in navigation", False)
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Navigation menu", False, str(e))
            self.save_screenshot("nav_error")
            return False

    def test_pricing_page_loads(self) -> bool:
        """Test that pricing page loads successfully."""
        print("\n📋 TEST: Pricing Page Load")
        try:
            # Navigate to pricing
            self.page.goto(f"{BASE_URL}/pricing", wait_until="networkidle", timeout=10000)
            
            # Wait for animations
            self.page.wait_for_timeout(1500)
            
            # Verify main heading
            try:
                expect(self.page.locator("h1")).to_be_visible(timeout=5000)
                self.log_test("Pricing page heading visible", True)
            except:
                self.log_test("Pricing page heading visible", False)
                self.save_screenshot("pricing_no_heading")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Pricing page loads", False, str(e))
            self.save_screenshot("pricing_load_error")
            return False

    def test_bingo_babes_progressive(self) -> bool:
        """Test Bingo Babes Progressive information display."""
        print("\n📋 TEST: Bingo Babes Progressive")
        try:
            # Check for Bingo Babes heading
            try:
                expect(self.page.locator("text=Bingo Babes Progressive")).to_be_visible(timeout=5000)
                self.log_test("Bingo Babes Progressive heading visible", True)
            except:
                self.log_test("Bingo Babes Progressive heading visible", False)
                self.save_screenshot("pricing_no_babes")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Bingo Babes Progressive", False, str(e))
            return False

    def test_hornet_progressive(self) -> bool:
        """Test Hornet Progressive information display."""
        print("\n📋 TEST: Hornet Progressive")
        try:
            # Check for Hornet heading (multiple possible text variations)
            try:
                hornet_text = self.page.locator("text=Hornet")
                expect(hornet_text).to_be_visible(timeout=5000)
                self.log_test("Hornet Progressive visible", True)
                return True
            except:
                # Try more specific selectors
                try:
                    daub_text = self.page.locator("text=Hornet Progressive Daub Ticket")
                    expect(daub_text).to_be_visible(timeout=5000)
                    self.log_test("Hornet Progressive Daub Ticket visible", True)
                    return True
                except:
                    self.log_test("Hornet Progressive visible", False)
                    self.save_screenshot("pricing_no_hornet")
                    return False
                
        except Exception as e:
            self.log_test("Hornet Progressive", False, str(e))
            return False

    def test_pricing_content_sections(self) -> bool:
        """Test that key pricing sections exist."""
        print("\n📋 TEST: Pricing Content Sections")
        try:
            # Check for daytime play section
            try:
                daytime_link = self.page.locator("a[href='#daytime']")
                if daytime_link.count() > 0:
                    self.log_test("Daytime play section reference", True)
                else:
                    self.log_test("Daytime play section reference", False, 
                                 "Daytime section link not found")
            except:
                self.log_test("Daytime play section reference", False)
            
            # Check for main session info
            try:
                session_text = self.page.locator("text=Evening Session")
                expect(session_text).to_be_visible(timeout=5000)
                self.log_test("Evening Session information visible", True)
                return True
            except:
                self.log_test("Evening Session information visible", False)
                self.save_screenshot("pricing_no_evening")
                return False
                
        except Exception as e:
            self.log_test("Pricing content sections", False, str(e))
            return False

    def test_pricing_page_responsive(self) -> bool:
        """Test pricing page with mobile viewport."""
        print("\n📋 TEST: Responsive Design (Mobile)")
        try:
            # Create mobile context
            mobile_context = self.browser.new_context(
                viewport={"width": 390, "height": 844}
            )
            mobile_page = mobile_context.new_page()
            
            # Navigate to pricing on mobile
            mobile_page.goto(f"{BASE_URL}/pricing", wait_until="networkidle", timeout=10000)
            mobile_page.wait_for_timeout(1500)
            
            # Check heading is visible
            try:
                expect(mobile_page.locator("h1")).to_be_visible(timeout=5000)
                self.log_test("Pricing page mobile responsive", True)
                
                # Save mobile screenshot
                mobile_page.screenshot(path=f"{SCREENSHOT_DIR}/pricing_mobile.png", full_page=True)
                print(f"     📸 Screenshot: {SCREENSHOT_DIR}/pricing_mobile.png")
                
                mobile_context.close()
                return True
            except:
                self.log_test("Pricing page mobile responsive", False)
                mobile_page.screenshot(path=f"{SCREENSHOT_DIR}/pricing_mobile_fail.png")
                mobile_context.close()
                return False
                
        except Exception as e:
            self.log_test("Responsive design", False, str(e))
            return False

    def test_pricing_page_screenshot(self) -> bool:
        """Save full page screenshot of pricing page."""
        print("\n📋 TEST: Pricing Page Screenshot")
        try:
            self.save_screenshot("pricing_page")
            return True
        except Exception as e:
            self.log_test("Pricing page screenshot", False, str(e))
            return False

    def run(self):
        """Run all tests."""
        print("=" * 70)
        print("PRICING PAGE & NAVIGATION VERIFICATION SUITE")
        print("=" * 70)
        
        if not self.setup():
            return 1
        
        try:
            # Run tests in sequence
            all_passed = True
            all_passed = self.test_navigation_menu() and all_passed
            all_passed = self.test_pricing_page_loads() and all_passed
            all_passed = self.test_bingo_babes_progressive() and all_passed
            all_passed = self.test_hornet_progressive() and all_passed
            all_passed = self.test_pricing_content_sections() and all_passed
            all_passed = self.test_pricing_page_responsive() and all_passed
            all_passed = self.test_pricing_page_screenshot() and all_passed
            
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
    test = PricingAndNavTest()
    exit_code = test.run()
    sys.exit(exit_code)
