from playwright.sync_api import sync_playwright

def debug_screenshot():
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
        page.goto("http://localhost:3000/admin")

        # Try to click tab
        try:
             page.get_by_role("button", name="Progressives").click()
             page.wait_for_timeout(2000)
        except Exception as e:
             print(f"Error clicking tab: {e}")

        page.screenshot(path="verification/debug.png", full_page=True)
        print("Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    debug_screenshot()
