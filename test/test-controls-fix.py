"""Test: controls fix, settings test area, fullscreen viewport."""
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

    # 1. Check menu renders
    page.screenshot(path="/tmp/fix-menu.png")
    print("Menu rendered")

    # 2. Go to settings
    settings_btn = page.locator("#btn-settings")
    if settings_btn.count():
        settings_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/fix-settings.png")
        print("Settings rendered")

        # Check control test area exists
        test_area = page.locator("#control-test-area")
        print(f"Control test area found: {test_area.count() > 0}")

        test_arrow = page.locator("#control-test-arrow")
        print(f"Test arrow found: {test_arrow.count() > 0}")

        test_hint = page.locator("#control-test-hint")
        if test_hint.count():
            print(f"Test hint text: {test_hint.inner_text()}")

        # Click D-pad mode
        dpad_btn = page.locator('#control-scheme-group button[data-mode="dpad"]')
        if dpad_btn.count():
            dpad_btn.click()
            page.wait_for_timeout(300)
            page.screenshot(path="/tmp/fix-settings-dpad.png")
            print("D-pad mode selected")

            # Check inline d-pad is visible
            test_dpad = page.locator("#control-test-dpad")
            dpad_visible = test_dpad.is_visible() if test_dpad.count() else False
            print(f"Test d-pad visible: {dpad_visible}")

        # Switch to tap mode
        tap_btn = page.locator('#control-scheme-group button[data-mode="tap"]')
        if tap_btn.count():
            tap_btn.click()
            page.wait_for_timeout(300)
            page.screenshot(path="/tmp/fix-settings-tap.png")
            print("Tap mode selected")
            if test_hint.count():
                print(f"Test hint text (tap): {test_hint.inner_text()}")

        # Switch back to swipe
        swipe_btn = page.locator('#control-scheme-group button[data-mode="swipe"]')
        if swipe_btn.count():
            swipe_btn.click()
            page.wait_for_timeout(300)

        # Go back to menu
        back_btn = page.locator("#btn-settings-back")
        if back_btn.count():
            back_btn.click()
            page.wait_for_timeout(500)

    # 3. Test gameplay — keyboard controls should work now
    cont_btn = page.locator("#btn-continue")
    if cont_btn.count():
        cont_btn.click()
        page.wait_for_timeout(500)

    start_btn = page.locator("#btn-start")
    if start_btn.count():
        start_btn.click()
        page.wait_for_timeout(3500)  # wait for countdown

    # Try keyboard input — this is the main controls fix test
    page.screenshot(path="/tmp/fix-gameplay-before.png")
    print("Gameplay started")

    for _ in range(3):
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(300)

    page.wait_for_timeout(500)
    page.screenshot(path="/tmp/fix-gameplay-after.png")
    print("Pressed arrow keys")

    # 4. Check viewport meta
    viewport_meta = page.locator('meta[name="viewport"]')
    if viewport_meta.count():
        content = viewport_meta.get_attribute("content")
        print(f"Viewport meta: {content}")

    # Check manifest link
    manifest_link = page.locator('link[rel="manifest"]')
    print(f"Manifest linked: {manifest_link.count() > 0}")

    # Check touch-action on body
    touch_action = page.evaluate("getComputedStyle(document.body).touchAction")
    print(f"Body touch-action: {touch_action}")

    print(f"\n=== ERRORS: {len(errors)} ===")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
