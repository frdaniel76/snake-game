"""Test: play level 9 (first key level) and check for freeze when collecting key."""
from playwright.sync_api import sync_playwright

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", lambda msg: print(f"  [{msg.type}] {msg.text}") if msg.type == "error" or "KEY" in msg.text.upper() or "FREEZE" in msg.text.upper() else None)
    page.on("pageerror", lambda err: (errors.append(err.message), print(f"  [PAGE ERROR] {err.message}")))

    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Inject a key collection tracer into the engine
    page.evaluate("""() => {
        // Monitor for errors during gameplay
        window.addEventListener('error', (e) => {
            console.error('UNCAUGHT: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
        });
    }""")

    # Navigate to level 9 (first key level)
    page.locator("#btn-play").click()
    page.wait_for_timeout(500)

    # Click first world (Green Meadow - but level 9 is in World 2)
    # Let's use the direct approach: set currentLevelId and go to level intro
    page.evaluate("""() => {
        // We need to access the game state - try localStorage approach
        const save = JSON.parse(localStorage.getItem('snake_quest_save') || '{}');
        // Unlock levels up to 9 by giving stars to levels 1-8
        for (let i = 1; i <= 8; i++) {
            if (!save.levelStars) save.levelStars = {};
            save.levelStars[i] = 1;
        }
        save.currentLevelId = 9;
        localStorage.setItem('snake_quest_save', JSON.stringify(save));
    }""")

    # Reload to pick up the save
    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Use continue to go directly to level 9
    cont = page.locator("#btn-continue")
    if cont.count():
        cont.click()
        page.wait_for_timeout(500)

    # Check we're on level 9 intro
    ui_text = page.inner_text("#ui-layer")
    print(f"Level intro: {ui_text[:150]}")

    start = page.locator("#btn-start")
    if start.count():
        start.click()
        page.wait_for_timeout(3500)  # countdown

    page.screenshot(path="/tmp/key-level-start.png")
    print("Level 9 gameplay started")

    # Level 9 has key at (3,14) and gate at (7,3)
    # Snake starts somewhere... let's check by injecting a position reader
    pos = page.evaluate("""() => {
        // Try to read snake position from the rendered state
        try {
            const canvas = document.getElementById('game-canvas');
            return { score: document.getElementById('hud-score')?.textContent };
        } catch(e) { return { error: e.message }; }
    }""")
    print(f"Initial state: {pos}")

    # Move around to find and collect the key
    # Move down and left to reach key at (3,14)
    for _ in range(8):
        page.keyboard.press("ArrowDown")
        page.wait_for_timeout(300)

    page.screenshot(path="/tmp/key-level-moving.png")

    for _ in range(5):
        page.keyboard.press("ArrowLeft")
        page.wait_for_timeout(300)

    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/key-level-near-key.png")

    # Keep moving to collect the key
    for _ in range(5):
        page.keyboard.press("ArrowDown")
        page.wait_for_timeout(300)

    page.wait_for_timeout(1000)

    # Check if game is still running (not frozen)
    score1 = page.evaluate("document.getElementById('hud-score')?.textContent")
    page.wait_for_timeout(500)
    page.screenshot(path="/tmp/key-level-after-key.png")

    # Try pressing a key to see if game responds
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(500)
    page.keyboard.press("ArrowUp")
    page.wait_for_timeout(500)
    score2 = page.evaluate("document.getElementById('hud-score')?.textContent")

    page.screenshot(path="/tmp/key-level-final.png")

    # Check if we're still on gameplay screen or if it froze
    has_hud = page.locator("#hud-score").count() > 0
    has_death = page.locator("#btn-retry").count() > 0
    has_complete = page.locator("#btn-menu-complete").count() > 0

    print(f"\nScore before: {score1}, after: {score2}")
    print(f"HUD visible: {has_hud}, Death screen: {has_death}, Complete: {has_complete}")
    print(f"Game state appears {'frozen' if has_hud and score1 == score2 else 'active'}")

    print(f"\nErrors: {len(errors)}")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
