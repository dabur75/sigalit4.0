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
  await page.click('button:has-text("עמית יחזקאלי")'); // Select a guide
  await page.waitForTimeout(2000);
  
  // Click vacation tab
  await page.click('button:has-text("חופשות")');
  await page.waitForTimeout(2000);
  
  // Check if button exists in DOM
  const buttonExists = await page.locator('button:has-text("שלח בקשה")').count();
  console.log('Button exists in DOM:', buttonExists > 0);
  
  if (buttonExists > 0) {
    const buttonVisible = await page.locator('button:has-text("שלח בקשה")').isVisible();
    console.log('Button is visible:', buttonVisible);
    
    const buttonBox = await page.locator('button:has-text("שלח בקשה")').boundingBox();
    console.log('Button bounding box:', buttonBox);
  }
  
  // Take a screenshot with scroll to show full content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.screenshot({ path: 'vacation-debug.png', fullPage: true });
  
  console.log('Debug screenshot saved');
  
  await browser.close();
})();