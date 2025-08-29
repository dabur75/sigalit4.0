import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Login and navigate
  await page.goto('http://localhost:8080/auth/signin');
  await page.waitForTimeout(3000);
  await page.fill('input[placeholder*="שם המשתמש"]', 'coordinator_dor');
  await page.fill('input[placeholder*="סיסמה"]', 'coordinator123');
  await page.click('button:has-text("התחבר")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  await page.goto('http://localhost:8080/constraints');
  await page.waitForTimeout(3000);
  await page.click('button:has-text("עמית יחזקאלי")');
  await page.waitForTimeout(2000);
  
  // Click vacation tab
  await page.click('button:has-text("חופשות")');
  await page.waitForTimeout(2000);
  
  // Scroll down to see if button is below
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);
  
  // Get all buttons and their info
  const allButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map((btn, index) => ({
      index,
      text: btn.textContent?.trim(),
      rect: btn.getBoundingClientRect(),
      visible: btn.offsetHeight > 0 && btn.offsetWidth > 0,
      display: getComputedStyle(btn).display,
      opacity: getComputedStyle(btn).opacity,
    })).filter(btn => btn.text?.includes('שלח') || btn.text?.includes('בקשה'));
  });
  
  console.log('Submit buttons found:', JSON.stringify(allButtons, null, 2));
  
  // Try to scroll the specific button into view
  try {
    await page.locator('button:has-text("שלח בקשה")').scrollIntoViewIfNeeded();
    console.log('Scrolled button into view');
  } catch (e) {
    console.log('Could not scroll button into view:', e.message);
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'debug-scroll-find.png', fullPage: true });
  
  await browser.close();
})();