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

    print("Navigating to Admin Schedule...")
    page.goto("http://localhost:3000/admin")

    # Wait for hydration
    page.wait_for_selector("#__nuxt")

    # Click Schedule Tab
    print("Clicking Schedule Tab...")
    page.get_by_role("button", name="Schedule").click()

    # Wait for Calendar
    print("Waiting for Calendar...")
    page.wait_for_selector("text=Schedule Control Room")

    # Hover over the first day cell that is in current month
    # We look for a cell that has text "1" or similar, but simpler to just grab a cell
    print("Hovering over a day cell...")
    # Select a day cell (e.g., the one with day number '15' to be safe it's middle of month)
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

        # Poll for server
        for i in range(30):
            try:
                page.goto("http://localhost:3000")
                break
            except:
                print(f"Waiting for server... {i}")
                time.sleep(2)

        try:
            verify_schedule_copy_feature(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
