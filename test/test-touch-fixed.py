"""Test: verify swipe/tap works with document-level touch handlers."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True)
    page = ctx.new_page()
    page.on("console", lambda msg: print(f"  [{msg.type}] {msg.text}") if msg.type != "log" or "TRACE" in msg.text or "EMIT" in msg.text or "INPUT" in msg.text else None)
    errors = []
    page.on("pageerror", lambda err: errors.append(err.message))

    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Add tracing inside input emit
    page.evaluate("""() => {
        // Trace all touch events on document
        document.addEventListener('touchstart', (e) => {
            console.log('TRACE doc-touchstart target=' + e.target.tagName + '#' + e.target.id);
        }, { capture: true, passive: true });
        document.addEventListener('touchend', (e) => {
            console.log('TRACE doc-touchend target=' + e.target.tagName + '#' + e.target.id);
        }, { capture: true, passive: true });
    }""")

    # Start gameplay
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)

    # Capture snake's initial position
    init_pos = page.evaluate("""() => {
        // The engine is module-scoped, but we can check the HUD
        return { score: document.getElementById('hud-score')?.textContent || 'N/A' };
    }""")
    print(f"Initial score: {init_pos['score']}")
    page.screenshot(path="/tmp/touch-fixed-start.png")

    # Simulate swipe UP using dispatchEvent on document
    print("\n--- Swipe UP via document dispatch ---")
    page.evaluate("""() => {
        const target = document.getElementById('game-canvas');
        const startTouch = new Touch({ identifier: 1, target: target, clientX: 195, clientY: 500 });
        document.dispatchEvent(new TouchEvent('touchstart', {
            touches: [startTouch], changedTouches: [startTouch], cancelable: true, bubbles: true
        }));
        setTimeout(() => {
            const endTouch = new Touch({ identifier: 1, target: target, clientX: 195, clientY: 350 });
            document.dispatchEvent(new TouchEvent('touchend', {
                touches: [], changedTouches: [endTouch], cancelable: true, bubbles: true
            }));
        }, 50);
    }""")
    page.wait_for_timeout(1500)
    page.screenshot(path="/tmp/touch-fixed-after-up.png")

    # Simulate swipe LEFT
    print("--- Swipe LEFT via document dispatch ---")
    page.evaluate("""() => {
        const target = document.getElementById('game-canvas');
        const startTouch = new Touch({ identifier: 2, target: target, clientX: 300, clientY: 400 });
        document.dispatchEvent(new TouchEvent('touchstart', {
            touches: [startTouch], changedTouches: [startTouch], cancelable: true, bubbles: true
        }));
        setTimeout(() => {
            const endTouch = new Touch({ identifier: 2, target: target, clientX: 150, clientY: 400 });
            document.dispatchEvent(new TouchEvent('touchend', {
                touches: [], changedTouches: [endTouch], cancelable: true, bubbles: true
            }));
        }, 50);
    }""")
    page.wait_for_timeout(1500)
    page.screenshot(path="/tmp/touch-fixed-after-left.png")

    # Now also test real Playwright touchscreen
    print("--- Playwright touchscreen.tap ---")
    page.touchscreen.tap(195, 400)
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/touch-fixed-after-tap.png")

    # Check final state
    final = page.evaluate("""() => {
        return { score: document.getElementById('hud-score')?.textContent || 'N/A (maybe dead)' };
    }""")
    print(f"\nFinal score: {final['score']}")

    print(f"\nErrors: {len(errors)}")
    for e in errors[:5]:
        print(f"  {e}")

    browser.close()
