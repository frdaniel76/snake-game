"""Test: smart D-pad with angle-based direction detection."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda err: errors.append(err.message))

    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Set D-pad mode
    page.locator("#btn-settings").click()
    page.wait_for_timeout(300)
    page.locator('#control-scheme-group button[data-mode="dpad"]').click()
    page.wait_for_timeout(300)
    page.locator("#btn-settings-back").click()
    page.wait_for_timeout(300)

    # Start gameplay
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)

    page.screenshot(path="/tmp/smart-dpad-start.png")

    # Get D-pad bounding box
    dpad = page.locator(".dpad-container")
    box = dpad.bounding_box()
    cx = box['x'] + box['width'] / 2
    cy = box['y'] + box['height'] / 2
    print(f"D-pad center: ({cx:.0f}, {cy:.0f}), size: {box['width']:.0f}x{box['height']:.0f}")

    # Test 1: Tap precisely on UP button area (top-center)
    up_x, up_y = cx, cy - box['height'] * 0.35
    print(f"\nTest 1: Precise UP tap at ({up_x:.0f}, {up_y:.0f})")
    page.evaluate(f"""() => {{
        const dpad = document.querySelector('.dpad-container');
        const t = new Touch({{ identifier: 10, target: dpad, clientX: {up_x}, clientY: {up_y} }});
        dpad.dispatchEvent(new TouchEvent('touchstart', {{
            touches: [t], changedTouches: [t], cancelable: true, bubbles: true
        }}));
    }}""")
    page.wait_for_timeout(800)
    page.screenshot(path="/tmp/smart-dpad-after-up.png")

    # Test 2: Tap slightly off-center but in the UP zone (between UP and RIGHT)
    offup_x, offup_y = cx + 15, cy - box['height'] * 0.3
    print(f"Test 2: Off-center UP tap at ({offup_x:.0f}, {offup_y:.0f})")
    page.evaluate(f"""() => {{
        const dpad = document.querySelector('.dpad-container');
        const t = new Touch({{ identifier: 11, target: dpad, clientX: {offup_x}, clientY: {offup_y} }});
        dpad.dispatchEvent(new TouchEvent('touchstart', {{
            touches: [t], changedTouches: [t], cancelable: true, bubbles: true
        }}));
    }}""")
    page.wait_for_timeout(800)

    # Test 3: Tap in LEFT zone
    left_x, left_y = cx - box['width'] * 0.35, cy
    print(f"Test 3: LEFT tap at ({left_x:.0f}, {left_y:.0f})")
    page.evaluate(f"""() => {{
        const dpad = document.querySelector('.dpad-container');
        const t = new Touch({{ identifier: 12, target: dpad, clientX: {left_x}, clientY: {left_y} }});
        dpad.dispatchEvent(new TouchEvent('touchstart', {{
            touches: [t], changedTouches: [t], cancelable: true, bubbles: true
        }}));
    }}""")
    page.wait_for_timeout(800)
    page.screenshot(path="/tmp/smart-dpad-after-left.png")

    # Test 4: Tap in the gap between buttons (should still register)
    gap_x, gap_y = cx + 20, cy + 20  # bottom-right of center gap
    print(f"Test 4: Gap tap at ({gap_x:.0f}, {gap_y:.0f}) — should register as RIGHT or DOWN")
    page.evaluate(f"""() => {{
        const dpad = document.querySelector('.dpad-container');
        const t = new Touch({{ identifier: 13, target: dpad, clientX: {gap_x}, clientY: {gap_y} }});
        dpad.dispatchEvent(new TouchEvent('touchstart', {{
            touches: [t], changedTouches: [t], cancelable: true, bubbles: true
        }}));
    }}""")
    page.wait_for_timeout(800)
    page.screenshot(path="/tmp/smart-dpad-after-gap.png")

    # Test 5: Tap dead center (should be ignored — dead zone)
    print(f"Test 5: Dead center tap at ({cx:.0f}, {cy:.0f}) — should be ignored")
    page.evaluate(f"""() => {{
        const dpad = document.querySelector('.dpad-container');
        const t = new Touch({{ identifier: 14, target: dpad, clientX: {cx}, clientY: {cy} }});
        dpad.dispatchEvent(new TouchEvent('touchstart', {{
            touches: [t], changedTouches: [t], cancelable: true, bubbles: true
        }}));
    }}""")
    page.wait_for_timeout(500)

    print(f"\nErrors: {len(errors)}")
    for e in errors[:5]:
        print(f"  {e}")

    browser.close()
    print("\nDone — check /tmp/smart-dpad-*.png")
