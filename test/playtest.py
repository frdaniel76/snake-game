"""Automated playtest: navigate through multiple levels, capture screenshots at each stage."""
from playwright.sync_api import sync_playwright

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda err: errors.append(f"[PAGE ERROR] {err.message}"))

    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Play level 1 and complete it
    cont = page.locator("#btn-continue")
    if cont.count():
        cont.click()
        page.wait_for_timeout(500)

    start = page.locator("#btn-start")
    if start.count():
        start.click()
        page.wait_for_timeout(300)

    # Level 1: snake at (7,15) facing RIGHT, food at (10,15), (10,10), (7,6)
    # Move right to eat first apple at (10,15)
    for _ in range(5):
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(200)
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/pt-level1-eating.png")

    # Move up toward (10,10)
    page.keyboard.press("ArrowUp")
    page.wait_for_timeout(2000)
    page.screenshot(path="/tmp/pt-level1-mid.png")

    # Move left then up to get (7,6)
    page.keyboard.press("ArrowLeft")
    page.wait_for_timeout(1500)
    page.keyboard.press("ArrowUp")
    page.wait_for_timeout(2000)
    page.screenshot(path="/tmp/pt-level1-end.png")

    # Wait for level complete or death
    page.wait_for_timeout(2000)
    page.screenshot(path="/tmp/pt-level1-result.png")

    # Check what screen we're on
    ui_text = page.inner_text("#ui-layer")
    print(f"After level 1 attempt: {ui_text[:100]}")

    # Try level 8 (portal level) — navigate to it
    # Go to menu first
    menu_btn = page.locator("#btn-menu-complete")
    if menu_btn.count():
        menu_btn.click()
        page.wait_for_timeout(500)
    else:
        # Maybe on death screen
        quit_btn = page.locator("#btn-quit-death")
        if quit_btn.count():
            quit_btn.click()
            page.wait_for_timeout(500)

    # Go to world map
    play_btn = page.locator("#btn-play")
    if play_btn.count():
        play_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/pt-worldmap.png")

    # Check if world 2 is locked
    cards = page.locator(".world-card")
    print(f"World cards found: {cards.count()}")

    # Take final screenshot
    page.screenshot(path="/tmp/pt-final.png")

    print(f"\nErrors: {len(errors)}")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
