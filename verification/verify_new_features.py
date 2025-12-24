from playwright.sync_api import sync_playwright

def verify_pricing(page):
    page.goto("http://localhost:3000/pricing")

    # Wait for data to load
    page.wait_for_selector("text=Evening Session")

    # Verify key sections
    assert page.is_visible("text=Tech-Assist Bundles")
    assert page.is_visible("text=Paper Specials")
    assert page.is_visible("text=Morning Play")
    assert page.is_visible("text=Afternoon Play")

    # Take screenshot of the whole page
    page.screenshot(path="verification/pricing_page.png", full_page=True)
    print("Pricing page verified.")

def verify_admin(page):
    page.goto("http://localhost:3000/admin/login")
    page.fill("input[name='password']", "admin123")
    page.click("button:has-text('Sign in')")

    page.wait_for_selector("text=Business Info")

    # Click Pricing Tab
    page.click("button:has-text('Pricing')")
    page.wait_for_selector("text=Edit the pricing JSON")

    page.screenshot(path="verification/admin_pricing.png")
    print("Admin pricing page verified.")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    try:
        verify_pricing(page)
        verify_admin(page)
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()
