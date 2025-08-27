import { test, expect } from '@playwright/test';

test('Login and check crew management', async ({ page }) => {
  // Navigate to signin page
  await page.goto('http://localhost:8080/auth/signin');
  await page.waitForTimeout(2000);
  
  // Login as admin using id selectors
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(3000);
  
  // Take screenshot of dashboard
  await page.screenshot({ path: 'dashboard-after-login.png', fullPage: true });
  
  console.log('Current URL:', page.url());
  
  // Check if we're on the dashboard
  const dashboardTitle = page.locator('h1:has-text("לוח הבקרה")');
  console.log('Dashboard title visible:', await dashboardTitle.isVisible());
  
  // Check if Quick Actions section exists
  const quickActions = page.locator('text=פעולות מהירות');
  console.log('Quick Actions section visible:', await quickActions.isVisible());
  
  if (await quickActions.isVisible()) {
    // Look for crew management button specifically
    const crewButton = page.locator('text=ניהול צוות');
    console.log('Crew management button visible:', await crewButton.isVisible());
    
    // List all action buttons in the Quick Actions section
    const actionButtons = page.locator('div:has-text("פעולות מהירות") >> .. >> button');
    const buttonCount = await actionButtons.count();
    console.log('Quick Action buttons found:', buttonCount);
    
    for (let i = 0; i < buttonCount; i++) {
      const buttonText = await actionButtons.nth(i).textContent();
      console.log(`Action Button ${i}:`, buttonText?.trim());
    }
    
    // Try to click on crew management if it exists
    if (await crewButton.isVisible()) {
      console.log('Clicking crew management button...');
      await crewButton.click();
      await page.waitForTimeout(2000);
      
      // Check if we navigated to crew page
      console.log('URL after clicking crew button:', page.url());
      await page.screenshot({ path: 'crew-page-after-click.png', fullPage: true });
    } else {
      console.log('Crew management button not found in Quick Actions');
    }
  }
  
  // Try direct navigation to crew page
  console.log('Trying direct navigation to /dashboard/crew...');
  await page.goto('http://localhost:8080/dashboard/crew');
  await page.waitForTimeout(3000);
  
  console.log('Direct crew page URL:', page.url());
  await page.screenshot({ path: 'direct-crew-page.png', fullPage: true });
  
  // Check what's on the crew page
  const crewPageContent = await page.textContent('body');
  console.log('Crew page content (first 400 chars):', crewPageContent?.substring(0, 400));
  
  // Look for key elements that should be on crew page
  const crewTitle = page.locator('h1:has-text("ניהול צוות")');
  console.log('Crew management title visible:', await crewTitle.isVisible());
  
  const addStaffButton = page.locator('button:has-text("הוסף איש צוות")');
  console.log('Add staff button visible:', await addStaffButton.isVisible());
  
  // Check for any error messages or loading states
  const loadingText = page.locator('text=טוען');
  console.log('Loading text visible:', await loadingText.isVisible());
  
  const errorElements = page.locator('[class*="error"], [class*="Error"]');
  const errorCount = await errorElements.count();
  console.log('Error elements found:', errorCount);
  
  if (errorCount > 0) {
    for (let i = 0; i < errorCount; i++) {
      const errorText = await errorElements.nth(i).textContent();
      console.log(`Error ${i}:`, errorText);
    }
  }
});