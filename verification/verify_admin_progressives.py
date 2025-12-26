import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_admin_progressives():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        context.add_cookies([{
            'name': 'admin_auth',
            'value': 'true',
            'domain': 'localhost',
            'path': '/'
        }])

        page = context.new_page()

        print("Navigating to Admin Dashboard...")
        page.goto("http://localhost:3000/admin")

        # Wait for loading to finish
        print("Waiting for hydration/loading...")
        expect(page.get_by_text("Synchronizing Data...")).to_be_hidden(timeout=10000)

        # Ensure we are on the page
        expect(page.get_by_text("Management Console")).to_be_visible()

        # Click Progressives Tab
        print("Clicking Progressives Tab...")
        # Use a more specific locator if needed, or wait a bit for hydration
        page.wait_for_timeout(1000)
        page.get_by_role("button", name="Progressives").click()

        # Wait for tab switch
        page.wait_for_timeout(500)

        # Verify Elements
        print("Verifying Progressive Elements...")
        # Check for key elements of ProgressiveEditor
        expect(page.get_by_text("Bingo Babes")).to_be_visible()
        expect(page.get_by_text("Daytime (4 PM)")).to_be_visible()
        expect(page.get_by_text("Hornet")).to_be_visible()
        # "Session" is ambiguous (used in button too), so we check for exact or context
        expect(page.get_by_text("Session", exact=True)).to_be_visible()

        # Verify W-2G Generator
        expect(page.get_by_text("W-2G Payout Calculator")).to_be_visible()

        print("Taking Admin Screenshot...")
        page.screenshot(path="verification/admin_progressives.png", full_page=True)

        # Public Page Verification
        print("Navigating to Public Home...")
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(2000) # Wait for animation/load

        print("Verifying Public Display...")
        # Check for "Current Progressive Amount" text
        expect(page.get_by_text("Current Progressive Amount")).to_be_visible()

        print("Taking Public Screenshot...")
        page.screenshot(path="verification/public_home.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_admin_progressives()
