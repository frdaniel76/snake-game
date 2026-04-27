"""Debug: check if touch/swipe events reach the canvas during gameplay."""
from playwright.sync_api import sync_playwright

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(
        viewport={"width": 390, "height": 844},
        has_touch=True,
    )
    page = ctx.new_page()
    page.on("console", lambda msg: print(f"  CONSOLE [{msg.type}]: {msg.text}"))
    page.on("pageerror", lambda err: errors.append(f"[PAGE ERROR] {err.message}"))

    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Inject debug listener on the canvas to see if touches arrive
    page.evaluate("""() => {
        const canvas = document.getElementById('game-canvas');
        const ui = document.getElementById('ui-layer');

        // Check pointer-events on ui-layer
        const uiStyle = getComputedStyle(ui);
        console.log('ui-layer pointer-events: ' + uiStyle.pointerEvents);
        console.log('ui-layer inline style: ' + ui.style.cssText);

        canvas.addEventListener('touchstart', (e) => {
            console.log('CANVAS touchstart at ' + e.touches[0].clientX + ',' + e.touches[0].clientY);
        }, { passive: true });
        canvas.addEventListener('touchend', (e) => {
            console.log('CANVAS touchend');
        }, { passive: true });

        // Also check what's on top at a mid-screen point
        const el = document.elementFromPoint(195, 500);
        console.log('Element at center (195,500): ' + el?.tagName + '#' + el?.id + ' class=' + el?.className);

        // Check all layers
        const els = document.elementsFromPoint(195, 500);
        for (const e of els) {
            const pe = getComputedStyle(e).pointerEvents;
            console.log('  Layer: ' + e.tagName + '#' + e.id + ' class=' + e.className?.substring?.(0,30) + ' pointer-events=' + pe);
        }
    }""")

    # Start gameplay
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)  # countdown

    # Re-check during gameplay
    page.evaluate("""() => {
        const ui = document.getElementById('ui-layer');
        console.log('--- DURING GAMEPLAY ---');
        console.log('ui-layer pointer-events: ' + getComputedStyle(ui).pointerEvents);
        console.log('ui-layer inline style: ' + ui.style.cssText);

        // Check what's at a gameplay area point (middle of board)
        const els = document.elementsFromPoint(195, 400);
        for (const e of els) {
            const pe = getComputedStyle(e).pointerEvents;
            console.log('  Layer: ' + e.tagName + '#' + e.id + ' class=' + e.className?.substring?.(0,40) + ' pointer-events=' + pe);
        }
    }""")

    page.screenshot(path="/tmp/touch-debug-gameplay.png")

    # Try touch swipe in the middle of the screen
    print("\n--- Attempting touch swipe ---")
    page.touchscreen.tap(195, 400)
    page.wait_for_timeout(200)

    # Manual swipe simulation
    page.evaluate("""() => {
        const canvas = document.getElementById('game-canvas');
        // Dispatch touch events directly on canvas
        function dispatchTouch(type, x, y) {
            const touch = new Touch({
                identifier: 1,
                target: canvas,
                clientX: x,
                clientY: y,
            });
            const evt = new TouchEvent(type, {
                touches: type === 'touchend' ? [] : [touch],
                changedTouches: [touch],
                cancelable: true,
                bubbles: true,
            });
            canvas.dispatchEvent(evt);
            console.log('Dispatched ' + type + ' on canvas at ' + x + ',' + y);
        }
        dispatchTouch('touchstart', 195, 400);
        setTimeout(() => {
            dispatchTouch('touchend', 195, 300);  // swipe UP
        }, 100);
    }""")
    page.wait_for_timeout(500)

    # Check snake direction after swipe
    snake_dir = page.evaluate("() => { try { return document.querySelector('#game-canvas').__snakeDir || 'unknown'; } catch(e) { return 'n/a'; } }")
    print(f"Snake dir after swipe: {snake_dir}")

    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/touch-debug-after-swipe.png")

    print(f"\n=== ERRORS: {len(errors)} ===")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
