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
            
            # The form is in the right column, inside a dark container
            # Let's find it by looking for the "Add New Member" heading
            form = page.locator("form")
            
            # Debug: print form count
            form_count = form.count()
            print(f"Found {form_count} forms on the page")
            
            if form_count > 0:
                # Fill the form
                # The first input is text (username), second is password
                inputs = page.locator("input")
                print(f"Found {inputs.count()} inputs")
                
                # Fill username
                username_input = page.locator("input[type='text']")
                if username_input.count() > 0:
                    username_input.first.fill("testcaller")
                    print("Filled username")
                else:
                    print("ERROR: Could not find text input")
                
                # Fill password
                password_input = page.locator("input[type='password']")
                if password_input.count() > 0:
                    password_input.first.fill("caller123")
                    print("Filled password")
                else:
                    print("ERROR: Could not find password input")
                
                # Select role
                select = page.locator("select")
                if select.count() > 0:
                    select.first.select_option("mic")
                    print("Selected role")
                else:
                    print("ERROR: Could not find select")
                
                # Click submit
                submit_btn = page.locator("button", has_text="Create Account")
                if submit_btn.count() > 0:
                    submit_btn.first.click()
                    print("Clicked submit")
                else:
                    print("ERROR: Could not find submit button")
                
                # Wait for the user to appear in the table
                page.wait_for_timeout(2000)
                
                # Check if user was added
                table = page.locator("table")
                if table.count() > 0:
                    if table.locator("text=testcaller").count() > 0:
                        print("SUCCESS: User 'testcaller' found in table!")
                    else:
                        print("User might not have been added yet, checking table content...")
                        print(table.inner_text()[:200])
                else:
                    print("ERROR: Table not found")
            else:
                print("ERROR: Form not found")
                print("Page content:", page.content()[:500])

            # 4. Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/admin_users.png")
            print("Screenshot saved to verification/admin_users.png")

            browser.close()

    if __name__ == "__main__":
        verify_admin_users()
except Exception as e:
    print(f"Script crashed: {e}")
