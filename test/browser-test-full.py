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

    # Menu
    page.screenshot(path="/tmp/snake-menu2.png")
    print("Menu rendered")

    # Click PLAY → World Map
    play_btn = page.locator("#btn-play")
    if play_btn.count() > 0:
        play_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/snake-worldmap.png")
        print("World map rendered")

        # Click first world card
        world_cards = page.locator("[data-world]")
        if world_cards.count() > 0:
            world_cards.first.click()
            page.wait_for_timeout(500)
            page.screenshot(path="/tmp/snake-levelselect.png")
            print("Level select rendered")

            # Click first level node
            level_nodes = page.locator("[data-level]")
            if level_nodes.count() > 0:
                level_nodes.first.click()
                page.wait_for_timeout(500)
                page.screenshot(path="/tmp/snake-levelintro2.png")
                print("Level intro rendered")

                # Start gameplay
                start_btn = page.locator("#btn-start")
                if start_btn.count() > 0:
                    start_btn.click()
                    page.wait_for_timeout(1500)
                    page.screenshot(path="/tmp/snake-gameplay3.png")
                    print("Gameplay rendered")

    # Also test CONTINUE button
    page.goto("http://localhost:8080/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    cont_btn = page.locator("#btn-continue")
    if cont_btn.count() > 0:
        cont_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/snake-continue.png")
        print("Continue → level intro rendered")

    print(f"\n=== ERRORS: {len(errors)} ===")
    for e in errors:
        print(f"  {e}")

    browser.close()
