"""Test: new control modes (tap, dpad, dual, both), no swipe."""
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

    # Check control buttons — should be Tap, D-pad, Dual, Both (NO swipe)
    btns = page.locator("#control-scheme-group button")
    print(f"Control buttons: {btns.count()}")
    for i in range(btns.count()):
        txt = btns.nth(i).inner_text()
        mode = btns.nth(i).get_attribute('data-mode')
        active = 'active' in (btns.nth(i).get_attribute('class') or '')
        print(f"  {txt} (mode={mode}) {'<-- ACTIVE' if active else ''}")

    # Verify NO swipe button exists
    swipe_btn = page.locator('#control-scheme-group button[data-mode="swipe"]')
    print(f"\nSwipe button exists: {swipe_btn.count() > 0}")

    page.screenshot(path="/tmp/newctrl-settings.png")

    # Select Dual mode
    page.locator('#control-scheme-group button[data-mode="dual"]').click()
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/newctrl-dual-settings.png")
    desc = page.locator("#control-desc")
    print(f"\nDual mode desc: {desc.inner_text()}")
    # Check dual test area visible
    test_dual = page.locator("#control-test-dual")
    print(f"Dual test area visible: {test_dual.is_visible()}")

    # Select D-pad mode and check D-pad position
    page.locator('#control-scheme-group button[data-mode="dpad"]').click()
    page.wait_for_timeout(300)

    # Go to gameplay with D-pad
    page.locator("#btn-settings-back").click()
    page.wait_for_timeout(300)
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)
    page.screenshot(path="/tmp/newctrl-dpad-gameplay.png")

    # Check D-pad is at bottom-right
    dpad = page.locator(".dpad-container")
    if dpad.count():
        box = dpad.bounding_box()
        print(f"\nD-pad position: right={390 - box['x'] - box['width']:.0f}px from right, bottom={844 - box['y'] - box['height']:.0f}px from bottom")
        print(f"D-pad NOT centered (right-aligned): {box['x'] + box['width'] / 2 > 250}")

    # Now test Dual mode in gameplay
    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)

    page.locator("#btn-settings").click()
    page.wait_for_timeout(300)
    page.locator('#control-scheme-group button[data-mode="dual"]').click()
    page.wait_for_timeout(300)
    page.locator("#btn-settings-back").click()
    page.wait_for_timeout(300)
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)
    page.screenshot(path="/tmp/newctrl-dual-gameplay.png")

    dual_pad = page.locator(".dual-pad")
    print(f"\nDual pad visible in gameplay: {dual_pad.count() > 0}")
    if dual_pad.count():
        box = dual_pad.bounding_box()
        print(f"Dual pad size: {box['width']:.0f}x{box['height']:.0f}")
        zones = page.locator(".dual-pad-zone")
        print(f"Dual pad zones: {zones.count()}")

    print(f"\n=== ERRORS: {len(errors)} ===")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
