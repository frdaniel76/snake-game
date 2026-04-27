"""Trace the full touch → input → engine chain during gameplay."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True)
    page = ctx.new_page()
    page.on("console", lambda msg: print(f"  [{msg.type}] {msg.text}"))

    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Start gameplay
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)

    # Inject tracing into the live input/engine chain
    page.evaluate("""() => {
        const canvas = document.getElementById('game-canvas');

        // Check canvas dimensions
        console.log('Canvas size: ' + canvas.width + 'x' + canvas.height);
        console.log('Canvas style: ' + canvas.style.width + ' x ' + canvas.style.height);

        // Intercept ALL touch events on the canvas to trace them
        ['touchstart', 'touchend', 'touchmove'].forEach(evtName => {
            canvas.addEventListener(evtName, (e) => {
                const t = e.touches?.[0] || e.changedTouches?.[0];
                console.log('TRACE ' + evtName + ' x=' + t?.clientX + ' y=' + t?.clientY + ' touches=' + e.touches.length + ' changed=' + e.changedTouches.length);
            }, { capture: true, passive: true });
        });

        // Also trace on document to see if events bubble
        document.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            console.log('DOC touchstart target=' + e.target.tagName + '#' + e.target.id + ' x=' + t.clientX + ' y=' + t.clientY);
        }, { capture: true, passive: true });
    }""")

    # Get initial snake position
    snake_before = page.evaluate("""() => {
        // Access engine session through module scope - we need to find it
        // Let's check if there's a way to read the snake position from the DOM/canvas
        // We'll read it via the HUD score to detect if food was eaten
        const score = document.getElementById('hud-score');
        return { score: score ? score.textContent : 'N/A' };
    }""")
    print(f"\nBefore touch - score: {snake_before['score']}")

    # Simulate a proper swipe using Playwright's touchscreen
    # First, let's do a tap to see if it's detected
    print("\n--- TAP at center ---")
    page.touchscreen.tap(195, 400)
    page.wait_for_timeout(500)

    # Now do a proper swipe (touchstart → touchmove → touchend with distance)
    print("\n--- SWIPE UP (manual touch sequence) ---")
    page.evaluate("""() => {
        const canvas = document.getElementById('game-canvas');

        // Find the actual input handler by examining event listeners
        // Instead, let's directly simulate a proper touch sequence
        const startTouch = new Touch({ identifier: 99, target: canvas, clientX: 195, clientY: 500 });
        const endTouch = new Touch({ identifier: 99, target: canvas, clientX: 195, clientY: 350 });

        canvas.dispatchEvent(new TouchEvent('touchstart', {
            touches: [startTouch], changedTouches: [startTouch], cancelable: true, bubbles: true
        }));

        // Small delay then touchend at different position
        setTimeout(() => {
            canvas.dispatchEvent(new TouchEvent('touchend', {
                touches: [], changedTouches: [endTouch], cancelable: true, bubbles: true
            }));
            console.log('SWIPE dispatched: 195,500 → 195,350 (UP, dist=150)');
        }, 50);
    }""")
    page.wait_for_timeout(1500)

    # Check if snake moved (wait for a few ticks)
    page.screenshot(path="/tmp/touch-chain-after-swipe.png")

    # Try Playwright's native touch approach
    print("\n--- NATIVE SWIPE via page.mouse (touch mode) ---")
    page.mouse.move(195, 500)
    page.mouse.down()
    page.mouse.move(195, 350, steps=5)
    page.mouse.up()
    page.wait_for_timeout(1500)
    page.screenshot(path="/tmp/touch-chain-after-native.png")

    # Final: Use keyboard as control to confirm engine is running
    print("\n--- KEYBOARD ArrowUp ---")
    page.keyboard.press("ArrowUp")
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/touch-chain-after-keyboard.png")

    snake_after = page.evaluate("""() => {
        const score = document.getElementById('hud-score');
        return { score: score ? score.textContent : 'N/A' };
    }""")
    print(f"\nAfter inputs - score: {snake_after['score']}")

    browser.close()
