import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to login page
  await page.goto('http://localhost:8080/auth/signin');
  
  // Wait for login form to load
  await page.waitForTimeout(3000);
  
  // Fill login form using placeholders as reference
  await page.fill('input[placeholder*="שם המשתמש"]', 'coordinator_dor');
  await page.fill('input[placeholder*="סיסמה"]', 'coordinator123');
  
  // Click login button (התחבר)
  await page.click('button:has-text("התחבר")');
  
  // Wait for successful login - should redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Now navigate to constraints page
  await page.goto('http://localhost:8080/constraints');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'constraints-page-logged-in.png', fullPage: true });
  
  console.log('Screenshot saved as constraints-page-logged-in.png');
  
  await browser.close();
})();