"""Test: sound themes and snake skins in settings."""
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
    page.screenshot(path="/tmp/opts-settings-top.png")

    # Scroll down to see all options
    page.evaluate("document.querySelector('.screen.active').scrollTop = 200")
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/opts-settings-audio.png")

    # Check sound theme buttons exist
    theme_btns = page.locator("#sound-theme-group button")
    print(f"Sound theme buttons: {theme_btns.count()}")
    for i in range(theme_btns.count()):
        print(f"  {theme_btns.nth(i).inner_text()} (theme={theme_btns.nth(i).get_attribute('data-theme')})")

    # Check snake skin buttons exist
    skin_btns = page.locator("#snake-skin-group button")
    print(f"\nSnake skin buttons: {skin_btns.count()}")
    for i in range(skin_btns.count()):
        print(f"  {skin_btns.nth(i).inner_text()} (skin={skin_btns.nth(i).get_attribute('data-skin')})")

    # Select synth theme
    page.locator('#sound-theme-group button[data-theme="synth"]').click()
    page.wait_for_timeout(300)
    print("\nSelected synth theme")

    # Select fire skin
    page.locator('#snake-skin-group button[data-skin="fire"]').click()
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/opts-settings-fire.png")
    print("Selected fire skin")

    # Check preview updated
    preview = page.locator("#skin-preview")
    print(f"Skin preview visible: {preview.is_visible()}")

    # Go back and start gameplay to verify skin works
    page.locator("#btn-settings-back").click()
    page.wait_for_timeout(300)
    page.locator("#btn-continue").click()
    page.wait_for_timeout(500)
    page.locator("#btn-start").click()
    page.wait_for_timeout(3500)
    page.screenshot(path="/tmp/opts-gameplay-fire.png")
    print("Gameplay with fire skin rendered")

    # Switch to blue skin via settings
    page.keyboard.press("Escape")  # won't work, use pause
    page.wait_for_timeout(200)

    print(f"\n=== ERRORS: {len(errors)} ===")
    for e in errors[:10]:
        print(f"  {e}")

    browser.close()
