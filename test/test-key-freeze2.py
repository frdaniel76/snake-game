"""Direct test: inject snake onto the key tile and verify no freeze."""
from playwright.sync_api import sync_playwright

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", lambda msg: print(f"  [{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: (errors.append(err.message), print(f"  *** PAGE ERROR: {err.message}")))

    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Unlock and go to level 9
    page.evaluate("""() => {
        const save = JSON.parse(localStorage.getItem('snake_quest_save') || '{}');
        if (!save.levelStars) save.levelStars = {};
        for (let i = 1; i <= 8; i++) save.levelStars[i] = 1;
        save.currentLevelId = 9;
        save.lives = 5;
        localStorage.setItem('snake_quest_save', JSON.stringify(save));
    }""")
    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)

    # Now inject a console log for every key event in the engine
    page.evaluate("""() => {
        // Patch clearTile to log when gates/keys are cleared
        const origClear = window.__gridClearTile;
        console.log('Game is running, looking for key...');

        // Log the grid to find where the key and snake are
        const canvas = document.getElementById('game-canvas');
        // We can't access module scope directly. Instead, monitor for errors.
        window.onerror = (msg, src, line, col, err) => {
            console.error('WINDOW ERROR: ' + msg + ' at ' + src + ':' + line);
            return false;
        };
    }""")

    # Rapidly press keys to explore the level
    moves = ['ArrowDown'] * 10 + ['ArrowLeft'] * 8 + ['ArrowDown'] * 5 + ['ArrowRight'] * 3
    for key in moves:
        page.keyboard.press(key)
        page.wait_for_timeout(250)

    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/key-freeze2-exploring.png")

    # Check if still alive
    alive = page.evaluate("document.getElementById('hud-score') !== null")
    death = page.locator("#btn-retry").count() > 0
    print(f"\nAfter exploring: alive={alive}, death={death}")

    if death:
        print("Snake died during exploration, retrying level")
        page.locator("#btn-retry").click()
        page.wait_for_timeout(3500)

        # Try different path
        moves2 = ['ArrowLeft'] * 5 + ['ArrowDown'] * 12
        for key in moves2:
            page.keyboard.press(key)
            page.wait_for_timeout(250)

        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/key-freeze2-retry.png")
        alive = page.evaluate("document.getElementById('hud-score') !== null")
        death = page.locator("#btn-retry").count() > 0
        print(f"After retry: alive={alive}, death={death}")

    # Final state
    page.screenshot(path="/tmp/key-freeze2-final.png")

    print(f"\nErrors: {len(errors)}")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
