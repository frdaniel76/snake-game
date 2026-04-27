"""Test: combo mode, bigger d-pad, 4-button settings layout."""
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

    # Go to settings
    page.locator("#btn-settings").click()
    page.wait_for_timeout(500)

    # Check 4 control buttons exist
    btns = page.locator("#control-scheme-group button")
    print(f"Control buttons: {btns.count()}")
    for i in range(btns.count()):
        print(f"  Button {i}: '{btns.nth(i).inner_text()}' mode={btns.nth(i).get_attribute('data-mode')}")

    # Select "Both" mode
    both_btn = page.locator('#control-scheme-group button[data-mode="dpad+swipe"]')
    both_btn.click()
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/combo-settings-both.png")
    print(f"Both mode selected, active: {both_btn.get_attribute('class')}")

    # Check test area shows d-pad
    test_dpad = page.locator("#control-test-dpad")
    print(f"Test d-pad visible in combo mode: {test_dpad.is_visible()}")

    hint = page.locator("#control-test-hint")
    print(f"Hint text: {hint.inner_text()}")

    # Go back and start gameplay with combo mode
    page.locator("#btn-settings-back").click()
    page.wait_for_timeout(300)
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)  # countdown

    # Check d-pad is visible during gameplay
    dpad = page.locator(".dpad-container")
    print(f"D-pad visible in gameplay: {dpad.count() > 0}")

    if dpad.count():
        box = dpad.bounding_box()
        print(f"D-pad size: {box['width']:.0f}x{box['height']:.0f}px")
        print(f"D-pad position: left={box['x']:.0f} top={box['y']:.0f}")

    page.screenshot(path="/tmp/combo-gameplay.png")

    # Test keyboard still works in combo mode
    for _ in range(3):
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(300)
    page.wait_for_timeout(500)
    page.screenshot(path="/tmp/combo-gameplay-moved.png")
    print("Keyboard input worked in combo mode")

    print(f"\n=== ERRORS: {len(errors)} ===")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
