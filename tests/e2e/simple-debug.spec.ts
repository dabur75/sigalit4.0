import { test, expect } from '@playwright/test';

test('Simple debug - check signin page', async ({ page }) => {
  // Navigate to home page first
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);
  
  // Take screenshot of home page
  await page.screenshot({ path: 'home-page-debug.png', fullPage: true });
  
  const homeContent = await page.textContent('body');
  console.log('Home page content:', homeContent?.substring(0, 300));
  
  // Navigate to signin page
  await page.goto('http://localhost:8080/auth/signin');
  await page.waitForTimeout(2000);
  
  // Take screenshot of signin page
  await page.screenshot({ path: 'signin-page-debug.png', fullPage: true });
  
  // Check what's on the signin page
  const signinContent = await page.textContent('body');
  console.log('Signin page content:', signinContent?.substring(0, 500));
  
  // Look for all input elements
  const inputs = page.locator('input');
  const inputCount = await inputs.count();
  console.log('Input elements found:', inputCount);
  
  for (let i = 0; i < inputCount; i++) {
    const inputType = await inputs.nth(i).getAttribute('type');
    const inputName = await inputs.nth(i).getAttribute('name');
    const inputId = await inputs.nth(i).getAttribute('id');
    console.log(`Input ${i}: type="${inputType}", name="${inputName}", id="${inputId}"`);
  }
  
  // Check if there are any forms
  const forms = page.locator('form');
  const formCount = await forms.count();
  console.log('Form elements found:', formCount);
});