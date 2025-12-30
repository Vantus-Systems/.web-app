import asyncio
from playwright.async_api import async_playwright


async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        console_messages = []

        def on_console(msg):
            console_messages.append({"type": msg.type, "text": msg.text()})

        page.on("console", on_console)

        routes = ["/admin/login", "/admin/mic/shifts", "/admin/people"]

        print("Starting admin console verification...")

        exit_code = 0

        for route in routes:
            url = f"http://localhost:3000{route}"
            print(f"Navigating to {url}...")
            try:
                await page.goto(url, timeout=30000)
                # Give the page some time to fully render and emit console messages
                await page.wait_for_timeout(1000)

                if console_messages:
                    print("Console messages captured:")
                    for cm in console_messages:
                        print(f"  [{cm['type'].upper()}] {cm['text']}")
                        # Treat console 'error' and 'warning' as failures
                        if cm["type"] in ("error", "warning"):
                            print("Detected error/warning in console — failing verification.")
                            exit_code = 2
                else:
                    print("No console messages captured.")

                # Check login page for password autocomplete
                if route == "/admin/login":
                    pw = await page.query_selector("input[type='password']")
                    if pw is None:
                        print("ERROR: password input not found on login page")
                        exit_code = 2
                    else:
                        autocomplete = await pw.get_attribute("autocomplete")
                        print(f"Password autocomplete: {autocomplete}")
                        if autocomplete not in ("current-password", "new-password"):
                            print("ERROR: password input missing appropriate autocomplete attribute")
                            exit_code = 2

                # clear console messages for next route
                console_messages.clear()

            except Exception as e:
                print(f"Error checking {route}: {e}")
                exit_code = 2

        await browser.close()

        if exit_code == 0:
            print("Admin console verification passed.")
        else:
            print("Admin console verification failed.")
        return exit_code


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
