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
  
  // Get computed style and position info
  const buttonInfo = await page.evaluate(() => {
    const button = document.querySelector('button[type="button"]:has(text)');
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitButton = buttons.find(btn => btn.textContent?.includes('שלח בקשה'));
    
    if (submitButton) {
      const rect = submitButton.getBoundingClientRect();
      const style = getComputedStyle(submitButton);
      const parentRect = submitButton.parentElement?.getBoundingClientRect();
      
      return {
        found: true,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        style: {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          overflow: style.overflow,
          position: style.position,
          top: style.top,
          left: style.left,
        },
        parentRect: parentRect ? { x: parentRect.x, y: parentRect.y, width: parentRect.width, height: parentRect.height } : null,
        isVisible: rect.width > 0 && rect.height > 0,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        text: submitButton.textContent
      };
    }
    return { found: false, allButtons: buttons.length };
  });
  
  console.log('Button info:', JSON.stringify(buttonInfo, null, 2));
  
  // Scroll the button into view if it exists
  if (buttonInfo.found) {
    await page.locator('button:has-text("שלח בקשה")').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'button-debug-advanced.png', fullPage: true });
  
  await browser.close();
})();