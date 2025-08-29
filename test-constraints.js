import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to constraints page
  await page.goto('http://localhost:8080/constraints');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'constraints-page.png', fullPage: true });
  
  console.log('Screenshot saved as constraints-page.png');
  
  await browser.close();
})();