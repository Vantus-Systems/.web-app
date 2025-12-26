import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_pricing_and_nav():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to Pricing Page...")
        page.goto("http://localhost:3000/pricing")

        # Wait for hydration
        page.wait_for_timeout(2000)

        print("Verifying Pricing Page Progressives...")
        # Check Bingo Babes Heading in Pricing section
        expect(page.get_by_role("heading", name="Bingo Babes Progressive")).to_be_visible()

        # Check Hornet Heading
        expect(page.get_by_role("heading", name="Hornet Progressive Daub Ticket")).to_be_visible()

        print("Taking Pricing Screenshot...")
        page.screenshot(path="verification/pricing_page.png", full_page=True)

        # Verify Navbar
        print("Verifying Navbar...")
        page.locator("header").screenshot(path="verification/navbar.png")

        print("Navbar Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    verify_pricing_and_nav()
