import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to login page
  await page.goto('http://localhost:8080/auth/signin');
  
  // Wait for login form to load
  await page.waitForTimeout(3000);
  
  // Fill login form
  await page.fill('input[placeholder*="שם המשתמש"]', 'coordinator_dor');
  await page.fill('input[placeholder*="סיסמה"]', 'coordinator123');
  
  // Click login button
  await page.click('button:has-text("התחבר")');
  
  // Wait for successful login
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navigate to constraints page
  await page.goto('http://localhost:8080/constraints');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Click on the first guide in the list (דביר הלל)
  await page.click('button:has-text("דביר הלל")');
  
  // Wait for the guide interface to load
  await page.waitForTimeout(2000);
  
  // Take screenshot showing the management buttons
  await page.screenshot({ path: 'constraints-with-guide-selected.png', fullPage: true });
  
  console.log('Screenshot with guide selected saved as constraints-with-guide-selected.png');
  
  await browser.close();
})();