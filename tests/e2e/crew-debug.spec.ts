import { test, expect } from '@playwright/test';

test('Debug crew management access', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:8080/auth/signin');
  
  // Login as admin
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(2000);
  
  // Take screenshot of dashboard
  await page.screenshot({ path: 'dashboard-debug.png', fullPage: true });
  
  // Check if Quick Actions section exists
  const quickActions = page.locator('text=פעולות מהירות');
  console.log('Quick Actions visible:', await quickActions.isVisible());
  
  // Look for crew management button
  const crewButton = page.locator('text=ניהול צוות');
  console.log('Crew button visible:', await crewButton.isVisible());
  
  // List all buttons in Quick Actions
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log('Total buttons found:', buttonCount);
  
  for (let i = 0; i < buttonCount; i++) {
    const buttonText = await buttons.nth(i).textContent();
    console.log(`Button ${i}:`, buttonText);
  }
  
  // Try to navigate directly to crew page
  await page.goto('http://localhost:8080/dashboard/crew');
  await page.waitForTimeout(2000);
  
  // Take screenshot of crew page
  await page.screenshot({ path: 'crew-page-debug.png', fullPage: true });
  
  // Check what's on the crew page
  const pageContent = await page.textContent('body');
  console.log('Crew page content preview:', pageContent?.substring(0, 500));
  
  // Check for any error messages
  const errors = page.locator('[class*="error"], [class*="Error"]');
  const errorCount = await errors.count();
  console.log('Error elements found:', errorCount);
  
  if (errorCount > 0) {
    for (let i = 0; i < errorCount; i++) {
      const errorText = await errors.nth(i).textContent();
      console.log(`Error ${i}:`, errorText);
    }
  }
  
  // Check browser console for any errors
  page.on('console', msg => console.log('Browser console:', msg.text()));
});