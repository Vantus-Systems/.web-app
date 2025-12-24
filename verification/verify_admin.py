print("Starting script...")
try:
    from playwright.sync_api import sync_playwright, expect
    import time

    def verify_admin_users():
        print("Launching browser...")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            print("Browser launched.")
            context = browser.new_context()
            page = context.new_page()

            page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

            # 1. Login
            print("Navigating to login...")
            page.goto("http://localhost:3000/admin/login")

            print("Logging in...")
            page.wait_for_selector("form")

            time.sleep(2)

            page.fill("input[name='username']", "admin")
            page.fill("input[name='password']", "admin123")

            page.click("button[type='submit']")

            # Wait for navigation to dashboard
            try:
                page.wait_for_url("http://localhost:3000/admin", timeout=10000)
                print("Logged in successfully.")
            except:
                print(f"Login failed or timed out. Current URL: {page.url}")
                page.screenshot(path="verification/login_fail.png")
                browser.close()
                return

            # 2. Check Users Tab
            print("Checking Users tab...")
            # Take screenshot of dashboard to see what's visible
            time.sleep(2) # Wait for data loading
            page.screenshot(path="verification/dashboard_debug.png")

            users_tab = page.locator("button", has_text="Users")

            if not users_tab.is_visible():
                print("Users tab not visible. Dumping page text:")
                print(page.inner_text("body"))

            expect(users_tab).to_be_visible()
            users_tab.click()

            # Wait for users table
            page.wait_for_selector("table")

            # 3. Create a new MIC user
            print("Creating new MIC user...")
            page.click("button:has-text('Add New User')")

            # Modal is open
            modal = page.locator("div[role='dialog']")
            expect(modal).to_be_visible()

            # Fill form in modal
            inputs = modal.locator("input")
            inputs.nth(0).fill("Test Caller") # Name
            inputs.nth(1).fill("mic_caller")  # Username

            modal.locator("select").select_option("mic") # Role

            inputs.nth(2).fill("caller123")   # Password

            print("Saving user...")
            modal.locator("button:has-text('Save')").click()

            # Wait for modal to close and user to appear in table
            expect(modal).to_be_hidden()
            expect(page.locator("table")).to_contain_text("mic_caller")

            print("User created.")

            # 4. Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/admin_users.png")

            browser.close()

    if __name__ == "__main__":
        verify_admin_users()
except Exception as e:
    print(f"Script crashed: {e}")
