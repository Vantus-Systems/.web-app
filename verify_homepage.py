
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        routes = [
            ("/", "homepage.png"),
            ("/schedule", "schedule.png"),
            ("/pricing", "pricing.png"),
            ("/about", "about.png"),
            ("/contact", "contact.png"),
            ("/house-rules", "house-rules.png")
        ]

        print("Starting verification...")

        for route, filename in routes:
            url = f"http://localhost:3001{route}"
            print(f"Navigating to {url}...")
            try:
                await page.goto(url, timeout=30000)
                # Wait for main content to ensure hydration
                await page.wait_for_selector('footer', timeout=10000)
                # Small delay to allow animations to settle
                await page.wait_for_timeout(1000)
                await page.screenshot(path=filename, full_page=True)
                print(f"Success: {filename} saved.")
            except Exception as e:
                print(f"Error checking {route}: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
