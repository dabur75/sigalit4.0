import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to login page
  await page.goto('http://localhost:8080/auth/signin');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take screenshot of login page
  await page.screenshot({ path: 'login-page.png', fullPage: true });
  
  console.log('Login page screenshot saved as login-page.png');
  
  await browser.close();
})();