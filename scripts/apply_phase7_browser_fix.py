#!/usr/bin/env python3
"""Apply minimal, idempotent Phase 7 browser QA corrections to a V5 checkout.

Source files are edited only after checking expected V5 markers. No git commands.
"""
from pathlib import Path

APP = Path('src/App.tsx')
CSS = Path('src/visual-system.css')
SPEC = Path('qa/specs/academy.spec.mjs')
MARKER = '/* Phase 7 mobile hit-target and document-flow correction (QA-20261121). */'
STYLE = '''
/* Phase 7 mobile hit-target and document-flow correction (QA-20261121). */
/* Avoid children from an older constrained-flex layout covering navigation. */
@media (max-width: 1050px) {
  .player-grid { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .lesson-right-column { display: block; width: 100%; min-width: 0; margin-top: 0; }
  .lesson-right-column .explanation {
    display: block; height: auto; min-height: 0; margin: 0;
    overflow: visible;
  }
  .lesson-right-column .side-spacer { display: none; }
  .lesson-right-column .side-actions {
    position: relative; z-index: 2; display: flex; align-items: stretch;
    margin-top: 22px; gap: 8px;
  }
  .lesson-right-column .side-actions button {
    min-height: 44px; position: relative; z-index: 1;
  }
}
/* Prevent the desktop search control from obscuring the theme toggle. */
@media (max-width: 780px) {
  .topbar { justify-content: space-between; }
  .topbar .brand {
    min-width: 0; flex: 1 1 auto; font-size: clamp(10px, 3vw, 12px);
    white-space: normal; line-height: 1.15;
  }
  .topbar .brand span:last-child { white-space: normal; }
  .topbar .actions {
    flex: 0 0 auto; min-width: 0; margin-left: auto;
    display: flex; gap: 7px; align-items: center;
  }
  .topbar .search-trigger {
    flex: 0 0 36px; width: 36px; min-width: 36px; max-width: 36px;
    padding: 6px; justify-content: center;
  }
  .topbar .search-trigger span, .topbar .search-trigger kbd { display: none; }
  .topbar .actions button[aria-label="Toggle theme"] {
    flex: 0 0 36px; width: 36px; min-width: 36px;
    padding: 6px;
  }
}
'''

# The browser may reserve Ctrl+K for search; keep the original keyboard handler and
# provide a cross-platform / shortcut that is delivered to a focused web page.
APP_ANCHOR = "    const target=event.target as HTMLElement|null\n"
APP_INSERT = """    // Browsers can reserve Ctrl+K. Slash is an additional in-page search shortcut.
    if (!searchOpen && event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
        !target?.matches('input,textarea,select,[contenteditable="true"]')) {
      event.preventDefault()
      setSearchOpen(true)
      return
    }
"""


def check():
    for p in (APP, CSS, SPEC):
        if not p.is_file():
            raise SystemExit(f'ERROR: missing {p}; run from the V5/Phase 7 project root')
    app=APP.read_text()
    css=CSS.read_text()
    spec=SPEC.read_text()
    if 'lesson-right-column' not in app or 'setSearchOpen' not in app:
        raise SystemExit('ERROR: V5 App.tsx structure not found, nothing changed')
    if APP_INSERT.strip() not in app and app.count(APP_ANCHOR)!=1:
        raise SystemExit('ERROR: keyboard handler differs; nothing changed')
    if '.lesson-right-column' not in css:
        raise SystemExit('ERROR: V5 visual CSS not found; nothing changed')
    if "page.getByRole('button', { name: 'Zoom in' })" not in spec and "getByRole('group', { name: 'Diagram camera controls' })" not in spec:
        raise SystemExit('ERROR: unsupported QA spec structure; nothing changed')
    return app,css,spec


def main():
    app,css,spec=check()
    if APP_INSERT.strip() not in app:
        app=app.replace(APP_ANCHOR,APP_ANCHOR+APP_INSERT,1)
    if MARKER not in css:
        css=css.rstrip()+'\n\n'+STYLE

    camera="page.getByRole('group', { name: 'Diagram camera controls' })"
    # Only distinguish camera zoom from lesson step '4 Zoom in'.
    spec=spec.replace("page.getByRole('button', { name: 'Zoom in' })",camera+".getByRole('button', { name: 'Zoom in', exact: true })")
    # Strict button names for the accessible-controls test.
    spec=spec.replace("page.getByRole('button', { name: label })", "page.getByRole('button', { name: label, exact: true })")
    old="""test('search opens with keyboard shortcut and navigates to a lesson', async ({ page }) => {
  await page.goto('/#/')
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog', { name: 'Search curriculum' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').fill('message queues')
  await dialog.getByRole('button', { name: /Message Queues/ }).click()
  await expect(page).toHaveURL(/#\\/message-queues\\/1$/)
  await expect(dialog).toHaveCount(0)
})"""
    new="""test('search opens with visible control or slash shortcut and navigates to a lesson', async ({ page }) => {
  await page.goto('/#/')
  const dialog = page.getByRole('dialog', { name: 'Search curriculum' })
  await page.getByRole('button', { name: 'Search lessons', exact: true }).click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.locator('body').focus()
  await page.keyboard.press('/')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').fill('message queues')
  await dialog.getByRole('button', { name: /Message Queues/ }).click()
  await expect(page).toHaveURL(/#\\/message-queues\\/1$/)
  await expect(dialog).toHaveCount(0)
})"""
    if old in spec:
        spec=spec.replace(old,new,1)
    elif 'search opens with visible control or slash shortcut' not in spec:
        raise SystemExit('ERROR: search E2E test differs; no files changed')

    # Explicitly verify the mobile theme and step controls are topmost.
    regression="""
test('mobile tap targets are not covered by lesson content or search', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile hit testing only')
  await page.goto(lessonUrl('hld-lld', 3))
  const next = page.getByRole('button', { name: 'Next step →', exact: true })
  await next.scrollIntoViewIfNeeded()
  const uncovered = await next.evaluate(el => {
    const box = el.getBoundingClientRect()
    const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
    return Boolean(top && (top === el || el.contains(top)))
  })
  expect(uncovered, 'Next step center should receive pointer events').toBe(true)
  await next.click()
  await expect(page).toHaveURL(/#\\/hld-lld\\/4$/)
  const theme = page.getByRole('button', { name: 'Toggle theme', exact: true })
  await theme.scrollIntoViewIfNeeded()
  await theme.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
"""
    if "mobile tap targets are not covered by lesson content or search" not in spec:
        spec=spec.rstrip()+'\n'+regression

    # All validation completed: writes begin only here.
    APP.write_text(app)
    CSS.write_text(css)
    SPEC.write_text(spec)
    print('Applied Phase 7 browser fixes: mobile layout, topbar controls, / search, exact zoom selectors, mobile hit-test.')
    print('No renderer, lesson content, or Git files changed.')

if __name__=='__main__':
    main()
