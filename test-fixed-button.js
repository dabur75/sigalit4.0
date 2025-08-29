import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Login and navigate to vacation tab
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
  
  // Take screenshot to verify button is now visible
  await page.screenshot({ path: 'vacation-button-fixed.png', fullPage: true });
  
  console.log('Fixed vacation tab screenshot saved');
  
  await browser.close();
})();