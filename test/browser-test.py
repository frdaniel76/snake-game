from playwright.sync_api import sync_playwright

errors = []
logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})  # iPhone 14 size

    # Capture console errors and logs
    page.on("console", lambda msg: (errors if msg.type == "error" else logs).append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: errors.append(f"[PAGE ERROR] {err.message}"))

    # Load the game
    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)  # Wait for fonts

    # Screenshot the menu
    page.screenshot(path="/tmp/snake-menu.png")
    print("=== MENU SCREEN ===")
    print(f"Title: {page.title()}")

    # Check for errors so far
    if errors:
        print("\n=== ERRORS ON LOAD ===")
        for e in errors:
            print(f"  {e}")

    # Check if PLAY button exists
    play_btn = page.locator("#btn-play")
    if play_btn.count() > 0:
        print("PLAY button found - clicking it")
        play_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/snake-level-intro.png")

        # Click START
        start_btn = page.locator("#btn-start")
        if start_btn.count() > 0:
            print("START button found - clicking it")
            start_btn.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="/tmp/snake-gameplay.png")

            # Try pressing arrow keys to play
            for _ in range(5):
                page.keyboard.press("ArrowRight")
                page.wait_for_timeout(200)

            page.wait_for_timeout(1000)
            page.screenshot(path="/tmp/snake-gameplay-playing.png")

            # Try moving down
            page.keyboard.press("ArrowDown")
            page.wait_for_timeout(2000)
            page.screenshot(path="/tmp/snake-gameplay-2.png")
        else:
            print("START button NOT found")
            page.screenshot(path="/tmp/snake-no-start.png")
    else:
        print("PLAY button NOT found")
        # Check page content
        content = page.inner_html("#ui-layer")
        print(f"UI layer content: {content[:500]}")

    # Print all errors
    print("\n=== ALL ERRORS ===")
    for e in errors:
        print(f"  {e}")

    print(f"\n=== CONSOLE LOGS ({len(logs)}) ===")
    for l in logs[:20]:
        print(f"  {l}")

    browser.close()
