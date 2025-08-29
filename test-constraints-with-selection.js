import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Login flow
  await page.goto('http://localhost:8080/auth/signin');
  await page.waitForTimeout(3000);
  await page.fill('input[placeholder*="שם המשתמש"]', 'coordinator_dor');
  await page.fill('input[placeholder*="סיסמה"]', 'coordinator123');
  await page.click('button:has-text("התחבר")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navigate to constraints and select guide
  await page.goto('http://localhost:8080/constraints');
  await page.waitForTimeout(3000);
  await page.click('button:has-text("דביר הלל")');
  await page.waitForTimeout(2000);
  
  // Click on a few calendar dates to select them
  await page.click('text="15"'); // Click on date 15
  await page.waitForTimeout(500);
  await page.click('text="16"'); // Click on date 16
  await page.waitForTimeout(500);
  
  // Take screenshot showing the management buttons
  await page.screenshot({ path: 'constraints-with-dates-selected.png', fullPage: true });
  
  console.log('Screenshot with dates selected saved');
  
  await browser.close();
})();