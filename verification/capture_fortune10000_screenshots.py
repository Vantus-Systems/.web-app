#!/usr/bin/env python3
"""
Capture Fortune-10000 screenshots of all pages
Desktop and mobile viewports
"""

import asyncio
from playwright.async_api import async_playwright
from pathlib import Path

BASE_URL = "http://localhost:3001"
SCREENSHOT_DIR = Path(__file__).parent

# Desktop viewport (1920x1080)
DESKTOP_VIEWPORT = {"width": 1920, "height": 1080}

# Mobile viewport (iPhone 12 Pro)
MOBILE_VIEWPORT = {"width": 390, "height": 844}

async def capture_screenshots():
    """Capture screenshots of all pages in desktop and mobile views"""
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch()
        
        print("🚀 Starting Fortune-10000 screenshot capture...")
        
        # ============================================================
        # DESKTOP SCREENSHOTS
        # ============================================================
        
        print("\n📸 Capturing DESKTOP screenshots...")
        context_desktop = await browser.new_context(viewport=DESKTOP_VIEWPORT)
        page_desktop = await context_desktop.new_page()
        
        # Homepage (with DailySpecials hero)
        print("  ✓ Homepage (desktop)...")
        await page_desktop.goto(BASE_URL, wait_until="networkidle")
        await page_desktop.wait_for_timeout(1000)  # Let animations settle
        await page_desktop.screenshot(
            path=SCREENSHOT_DIR / "homepage_fortune10000_desktop.png",
            full_page=True
        )
        
        # Pricing page (enhanced hero + testimonials)
        print("  ✓ Pricing page (desktop)...")
        await page_desktop.goto(f"{BASE_URL}/pricing", wait_until="networkidle")
        await page_desktop.wait_for_timeout(1000)
        await page_desktop.screenshot(
            path=SCREENSHOT_DIR / "pricing_fortune10000_desktop.png",
            full_page=True
        )
        
        # Schedule page (timeline cards)
        print("  ✓ Schedule page (desktop)...")
        await page_desktop.goto(f"{BASE_URL}/schedule", wait_until="networkidle")
        await page_desktop.wait_for_timeout(1000)
        await page_desktop.screenshot(
            path=SCREENSHOT_DIR / "schedule_fortune10000_desktop.png",
            full_page=True
        )
        
        # About page
        print("  ✓ About page (desktop)...")
        await page_desktop.goto(f"{BASE_URL}/about", wait_until="networkidle")
        await page_desktop.wait_for_timeout(1000)
        await page_desktop.screenshot(
            path=SCREENSHOT_DIR / "about_fortune10000_desktop.png",
            full_page=True
        )
        
        # Contact page
        print("  ✓ Contact page (desktop)...")
        await page_desktop.goto(f"{BASE_URL}/contact", wait_until="networkidle")
        await page_desktop.wait_for_timeout(1000)
        await page_desktop.screenshot(
            path=SCREENSHOT_DIR / "contact_fortune10000_desktop.png",
            full_page=True
        )
        
        await context_desktop.close()
        
        # ============================================================
        # MOBILE SCREENSHOTS
        # ============================================================
        
        print("\n📱 Capturing MOBILE screenshots...")
        context_mobile = await browser.new_context(viewport=MOBILE_VIEWPORT)
        page_mobile = await context_mobile.new_page()
        
        # Homepage (mobile)
        print("  ✓ Homepage (mobile)...")
        await page_mobile.goto(BASE_URL, wait_until="networkidle")
        await page_mobile.wait_for_timeout(1000)
        await page_mobile.screenshot(
            path=SCREENSHOT_DIR / "homepage_fortune10000_mobile.png",
            full_page=True
        )
        
        # Pricing page (mobile)
        print("  ✓ Pricing page (mobile)...")
        await page_mobile.goto(f"{BASE_URL}/pricing", wait_until="networkidle")
        await page_mobile.wait_for_timeout(1000)
        await page_mobile.screenshot(
            path=SCREENSHOT_DIR / "pricing_fortune10000_mobile.png",
            full_page=True
        )
        
        # Schedule page (mobile)
        print("  ✓ Schedule page (mobile)...")
        await page_mobile.goto(f"{BASE_URL}/schedule", wait_until="networkidle")
        await page_mobile.wait_for_timeout(1000)
        await page_mobile.screenshot(
            path=SCREENSHOT_DIR / "schedule_fortune10000_mobile.png",
            full_page=True
        )
        
        # About page (mobile)
        print("  ✓ About page (mobile)...")
        await page_mobile.goto(f"{BASE_URL}/about", wait_until="networkidle")
        await page_mobile.wait_for_timeout(1000)
        await page_mobile.screenshot(
            path=SCREENSHOT_DIR / "about_fortune10000_mobile.png",
            full_page=True
        )
        
        # Contact page (mobile)
        print("  ✓ Contact page (mobile)...")
        await page_mobile.goto(f"{BASE_URL}/contact", wait_until="networkidle")
        await page_mobile.wait_for_timeout(1000)
        await page_mobile.screenshot(
            path=SCREENSHOT_DIR / "contact_fortune10000_mobile.png",
            full_page=True
        )
        
        await context_mobile.close()
        
        # Close browser
        await browser.close()
        
        print("\n✅ All Fortune-10000 screenshots captured successfully!")
        print(f"📁 Saved to: {SCREENSHOT_DIR}")
        print("\nDesktop screenshots:")
        print("  - homepage_fortune10000_desktop.png")
        print("  - pricing_fortune10000_desktop.png")
        print("  - schedule_fortune10000_desktop.png")
        print("  - about_fortune10000_desktop.png")
        print("  - contact_fortune10000_desktop.png")
        print("\nMobile screenshots:")
        print("  - homepage_fortune10000_mobile.png")
        print("  - pricing_fortune10000_mobile.png")
        print("  - schedule_fortune10000_mobile.png")
        print("  - about_fortune10000_mobile.png")
        print("  - contact_fortune10000_mobile.png")

if __name__ == "__main__":
    asyncio.run(capture_screenshots())
