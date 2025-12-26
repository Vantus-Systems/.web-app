import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_w2g_signature():
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

        # Wait for loading
        expect(page.get_by_text("Synchronizing Data...")).to_be_hidden(timeout=10000)

        # Click Progressives Tab
        page.wait_for_timeout(1000)
        page.get_by_role("button", name="Progressives").click()
        page.wait_for_timeout(500)

        # Trigger W-2G requirement (set payout > 1200)
        print("Setting payout to trigger W-2G...")
        # Assuming input is the first number input in W2G section
        # The first input in W2GGenerator is Total Payout
        # Locator: Label "Total Payout Amount" -> input
        # Note: We need to locate inputs specifically.

        # Using placeholder or type since labels are separate
        # But we can assume order or use label association if implemented properly.
        # Currently labels are separate <label> and <input>.

        # Let's target by proximity to text
        total_payout_input = page.locator("div.grid input[type='number']").nth(0) # First one likely current prog
        # Wait, there are multiple inputs on the page (Progressives too).
        # We need to target the W2G section.

        w2g_section = page.locator(".space-y-8", has_text="W-2G Payout Calculator")
        total_input = w2g_section.locator("input[type='number']").nth(0)

        total_input.fill("1500") # > 1200

        # Verify W-2G Form appears
        expect(page.get_by_text("Player Information & W-2G Generation")).to_be_visible()

        # Fill Player Info
        print("Filling Player Info...")
        page.get_by_placeholder("John Doe").fill("Playwright Tester")
        page.get_by_placeholder("XXX-XX-XXXX").fill("123-45-6789")

        # Test Signature Drawing
        print("Testing Signature Drawing...")
        canvas = page.locator("canvas")
        box = canvas.bounding_box()
        if box:
            page.mouse.move(box["x"] + 10, box["y"] + 10)
            page.mouse.down()
            page.mouse.move(box["x"] + 100, box["y"] + 50)
            page.mouse.up()
            print("Drew on canvas.")
        else:
            print("Canvas not found!")
            exit(1)

        # Click Generate & Print
        # We need to mock window.print to avoid blocking or handle it?
        # Playwright headless handles window.print by doing nothing usually, or we can stub it.

        print("Clicking Generate...")

        # Mock print
        page.evaluate("window.print = () => { console.log('Print called'); }")

        page.get_by_text("Generate & Print W-2G").click()

        # Verify Print View appears (check for "Form W-2G" text which is in print-only div)
        # Note: print-only div has display:none except media print.
        # But we toggle `isPrinting` ref which adds it to DOM.
        # However, style block sets .print-only { display: none } by default.
        # And media print sets it to block.
        # So it might not be visible to 'expect(..).to_be_visible()' unless we emulate print media.

        # But `isPrinting` v-if adds it to DOM.
        # If we want to verify content exists in DOM:
        expect(page.locator(".print-only")).to_be_attached()

        print("Taking W-2G Screenshot...")
        page.screenshot(path="verification/w2g_form.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_w2g_signature()
