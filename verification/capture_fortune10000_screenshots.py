#!/usr/bin/env python3
"""
Fortune-10000 Screenshot Capture Suite

Captures high-quality screenshots of all pages in both desktop and mobile viewports
for Fortune-1000 level client delivery. Production-ready with robust error handling.

Usage: python3 capture_fortune10000_screenshots.py
"""

import asyncio
import sys
from playwright.async_api import async_playwright, TimeoutError
from pathlib import Path
from typing import Optional

BASE_URL = "http://localhost:3001"
SCREENSHOT_DIR = Path(__file__).parent

# Ensure screenshots directory exists
SCREENSHOT_DIR.mkdir(exist_ok=True)

# Desktop viewport (1920x1080)
DESKTOP_VIEWPORT = {"width": 1920, "height": 1080}

# Mobile viewport (iPhone 12 Pro)
MOBILE_VIEWPORT = {"width": 390, "height": 844}

# Test configuration
WAIT_FOR_NETWORK = "networkidle"
ANIMATION_DELAY_MS = 1500
TIMEOUT_MS = 30000

async def verify_page_loaded(page, page_name: str) -> bool:
    """Verify that the page loaded successfully by checking for primary content."""
    try:
        # All pages have a main content area
        await page.wait_for_selector("main, section", timeout=5000)
        print(f"  ✓ {page_name} loaded successfully")
        return True
    except TimeoutError:
        print(f"  ✗ {page_name} failed to load primary content")
        return False

async def capture_page_screenshot(
    page, 
    url: str, 
    page_name: str, 
    viewport_type: str
) -> Optional[Path]:
    """Capture a single page screenshot with error handling."""
    try:
        print(f"  Capturing {page_name} ({viewport_type})...")
        await page.goto(url, wait_until=WAIT_FOR_NETWORK, timeout=TIMEOUT_MS)
        
        # Verify page loaded
        if not await verify_page_loaded(page, page_name):
            return None
            
        # Wait for animations
        await page.wait_for_timeout(ANIMATION_DELAY_MS)
        
        # Generate filename
        safe_name = page_name.lower().replace(" ", "_").replace("(", "").replace(")", "")
        filename = f"{safe_name}_fortune10000_{viewport_type}.png"
        filepath = SCREENSHOT_DIR / filename
        
        # Take screenshot
        await page.screenshot(path=str(filepath), full_page=True)
        print(f"    ✓ Saved: {filename}")
        return filepath
        
    except TimeoutError:
        print(f"    ✗ Timeout navigating to {url}")
        return None
    except Exception as e:
        print(f"    ✗ Error capturing {page_name}: {str(e)}")
        return None

async def capture_screenshots():
    """Capture screenshots of all pages in desktop and mobile views."""
    
    pages_to_capture = [
        ("Homepage", "/"),
        ("Pricing", "/pricing"),
        ("Schedule", "/schedule"),
        ("About", "/about"),
        ("Contact", "/contact"),
    ]
    
    async with async_playwright() as p:
        browser = None
        try:
            # Launch browser
            browser = await p.chromium.launch(headless=True)
            print("✅ Browser launched successfully")
            
            results = {
                "desktop": [],
                "mobile": [],
                "failed": []
            }
            
            # ============================================================
            # DESKTOP SCREENSHOTS
            # ============================================================
            
            print("\n📸 Capturing DESKTOP screenshots (1920x1080)...")
            try:
                context_desktop = await browser.new_context(viewport=DESKTOP_VIEWPORT)
                page_desktop = await context_desktop.new_page()
                
                for page_name, path in pages_to_capture:
                    url = f"{BASE_URL}{path}"
                    result = await capture_page_screenshot(
                        page_desktop, 
                        url, 
                        page_name, 
                        "desktop"
                    )
                    if result:
                        results["desktop"].append((page_name, result))
                    else:
                        results["failed"].append(f"{page_name} (desktop)")
                
                await context_desktop.close()
            except Exception as e:
                print(f"✗ Desktop context error: {str(e)}")
                results["failed"].extend([f"{name} (desktop)" for name, _ in pages_to_capture])
            
            # ============================================================
            # MOBILE SCREENSHOTS
            # ============================================================
            
            print("\n📱 Capturing MOBILE screenshots (390x844 - iPhone 12 Pro)...")
            try:
                context_mobile = await browser.new_context(viewport=MOBILE_VIEWPORT)
                page_mobile = await context_mobile.new_page()
                
                for page_name, path in pages_to_capture:
                    url = f"{BASE_URL}{path}"
                    result = await capture_page_screenshot(
                        page_mobile, 
                        url, 
                        page_name, 
                        "mobile"
                    )
                    if result:
                        results["mobile"].append((page_name, result))
                    else:
                        results["failed"].append(f"{page_name} (mobile)")
                
                await context_mobile.close()
            except Exception as e:
                print(f"✗ Mobile context error: {str(e)}")
                results["failed"].extend([f"{name} (mobile)" for name, _ in pages_to_capture])
            
            # ============================================================
            # REPORT RESULTS
            # ============================================================
            
            print("\n" + "=" * 70)
            print("SCREENSHOT CAPTURE SUMMARY")
            print("=" * 70)
            
            total_captured = len(results["desktop"]) + len(results["mobile"])
            total_expected = len(pages_to_capture) * 2
            
            print(f"\n✅ Desktop Screenshots ({len(results['desktop'])}/{len(pages_to_capture)}):")
            for page_name, filepath in results["desktop"]:
                print(f"   • {filepath.name}")
            
            print(f"\n✅ Mobile Screenshots ({len(results['mobile'])}/{len(pages_to_capture)}):")
            for page_name, filepath in results["mobile"]:
                print(f"   • {filepath.name}")
            
            if results["failed"]:
                print(f"\n❌ Failed ({len(results['failed'])}):")
                for failed in results["failed"]:
                    print(f"   • {failed}")
            
            print(f"\n📊 Total: {total_captured}/{total_expected} screenshots captured")
            print(f"📁 Location: {SCREENSHOT_DIR}")
            
            # Exit with appropriate code
            if len(results["failed"]) == 0:
                print("\n✅ All screenshots captured successfully!")
                return 0
            else:
                print(f"\n⚠️  {len(results['failed'])} screenshots failed to capture")
                return 1
                
        except Exception as e:
            print(f"\n❌ Fatal error: {str(e)}")
            return 1
        finally:
            if browser:
                await browser.close()
                print("\n🔒 Browser closed")

if __name__ == "__main__":
    exit_code = asyncio.run(capture_screenshots())
    sys.exit(exit_code)
