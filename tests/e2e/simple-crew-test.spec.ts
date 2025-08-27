import { test, expect } from '@playwright/test';

test('Simple crew management test', async ({ page }) => {
  // Just take screenshots to see what's happening
  await page.goto('http://localhost:8080/auth/signin');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  console.log('After login, URL:', page.url());
  
  await page.goto('http://localhost:8080/dashboard/crew');
  await page.waitForTimeout(5000);
  
  console.log('Crew page URL:', page.url());
  
  // Take a screenshot to see what's actually displayed
  await page.screenshot({ path: 'actual-crew-page.png', fullPage: true });
  
  // Get page content to debug
  const content = await page.textContent('body');
  console.log('Page content preview:', content?.substring(0, 200));
  
  // Check if there's any error or loading state
  const hasError = await page.locator('text=Error').count();
  const hasLoading = await page.locator('text=טוען').count();
  
  console.log('Errors found:', hasError);
  console.log('Loading elements found:', hasLoading);
});