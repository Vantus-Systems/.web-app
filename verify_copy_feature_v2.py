import time
from playwright.sync_api import sync_playwright, expect

def verify_schedule_copy_feature(page):
    # Set auth cookie
    page.context.add_cookies([{
        "name": "admin_auth",
        "value": "true",
        "domain": "localhost",
        "path": "/"
    }])

    # Capture console
    page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"BROWSER ERROR: {exc}"))

    print("Navigating to Admin Schedule...")
    page.goto("http://localhost:3000/admin")

    # Wait for hydration
    page.wait_for_selector("#__nuxt")

    # Check if we are on Business Info
    expect(page.get_by_text("Corporate Identity & Contact")).to_be_visible()
    print("On Business Info tab.")

    # Click Schedule Tab
    # Use a very specific selector for the admin tabs
    print("Clicking Schedule Tab...")
    # The admin tabs are in a nav with class 'bg-primary-950'.
    # We can find the button inside that specific context.
    schedule_tab = page.locator("nav.bg-primary-950 button").filter(has_text="Schedule")
    schedule_tab.click()

    # Wait for the Header to update to "Schedule"
    print("Waiting for Tab Switch...")
    # The header h1
    expect(page.locator("h1", has_text="Schedule")).to_be_visible()

    # Wait for Calendar
    print("Waiting for Calendar...")
    page.wait_for_selector("text=Schedule Control Room")

    # Hover over a day cell
    print("Hovering over a day cell...")
    day_cell = page.locator(".min-h-\\[140px\\]").nth(15)
    day_cell.hover()

    # Verify Copy Button is present (it has title "Copy Schedule to Entire Month")
    copy_btn = day_cell.locator("button[title='Copy Schedule to Entire Month']")

    print("Verifying Copy Button visibility...")
    expect(copy_btn).to_be_visible()

    # Take screenshot of the hovered state
    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/schedule_copy_feature.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            verify_schedule_copy_feature(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_retry.png")
        finally:
            browser.close()
