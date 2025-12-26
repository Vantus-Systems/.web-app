from playwright.sync_api import sync_playwright


def debug_jackpot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_msgs = []
        requests = []
        responses = []
        bad_responses = []
        js_errors = []

        def on_console(msg):
            console_msgs.append(f"{msg.type}: {msg.text}")

        def on_request(req):
            if req.url.endswith("/api/jackpot"):
                requests.append(req)

        def on_response(resp):
            try:
                status = resp.status
            except Exception:
                status = None
            if status and status >= 400:
                # capture small snippet of failed response
                try:
                    body = resp.text()
                except Exception:
                    body = "<could not read body>"
                bad_responses.append((resp.url, status, body[:500]))
            if resp.url.endswith("/api/jackpot"):
                try:
                    body = resp.text()
                except Exception:
                    body = "<could not read body>"
                responses.append((resp.status, body))

        def on_page_error(err):
            js_errors.append(str(err))

        page.on("console", on_console)
        page.on("request", on_request)
        page.on("response", on_response)
        page.on("pageerror", on_page_error)

        page.goto("http://localhost:3000", timeout=60000)

        # give the page some time to make client-side requests
        page.wait_for_timeout(3000)

        page.screenshot(path="verification/debug_jackpot.png", full_page=True)

        # Try to read the rendered jackpot label + amount from the DOM
        dom_check = page.evaluate('''() => {
            const labels = Array.from(document.querySelectorAll('span'));
            for (const el of labels) {
                if (el.textContent && el.textContent.trim().includes('Shamrock Progressive Jackpot')) {
                    const sib = el.nextElementSibling;
                    return {
                        label: el.textContent.trim(),
                        amount: sib ? sib.textContent.trim() : null,
                        amountHTML: sib ? sib.outerHTML : null,
                        containerHTML: el.parentElement ? el.parentElement.outerHTML : null
                    };
                }
            }
            return null;
        }''')

        print("DOM CHECK:", dom_check)

        print("CONSOLE MESSAGES:")
        for m in console_msgs:
            print(m)

        print("JS ERRORS:")
        for e in js_errors:
            print(e)

        print("/api/jackpot REQUESTS COUNT:", len(requests))
        print("/api/jackpot RESPONSES:")
        for status, body in responses:
            print(status, body[:200])

        if bad_responses:
            print("FAILED RESOURCES:")
            for url, status, snippet in bad_responses:
                print(status, url, snippet[:200])

        # Inspect global Nuxt payload / state to see if jackpot was captured during SSR
        nuxt_state = page.evaluate("""() => {
            const nuxt = window.__NUXT__ || window.__NUXT__payload || window.__NUXT__?.state || null;
            if (!nuxt) return { present: false };
            const s = JSON.stringify(nuxt);
            return { present: true, snippet: s.slice(0, 2000), containsJackpot: s.includes('jackpot') };
        }""")
        print("NUXT STATE:", nuxt_state)

        browser.close()


if __name__ == "__main__":
    debug_jackpot()
