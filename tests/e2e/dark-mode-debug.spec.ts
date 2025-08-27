import { test, expect } from '@playwright/test';

test('Debug dark mode styling', async ({ page }) => {
  // Login as admin
  await page.goto('http://localhost:8080/auth/signin');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await page.waitForTimeout(3000);
  
  console.log('=== Dark Mode Debugging ===');
  
  // Check HTML element classes
  const htmlClasses = await page.getAttribute('html', 'class');
  console.log('HTML classes:', htmlClasses);
  
  // Check body element classes and styles
  const bodyClasses = await page.getAttribute('body', 'class');
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    return {
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      colorScheme: computedStyle.colorScheme
    };
  });
  console.log('Body classes:', bodyClasses);
  console.log('Body computed styles:', bodyStyles);
  
  // Check if 'dark' class exists anywhere
  const darkElements = await page.locator('.dark').count();
  console.log('Elements with dark class:', darkElements);
  
  // Check CSS media query
  const prefersColorScheme = await page.evaluate(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  console.log('System prefers dark mode:', prefersColorScheme);
  
  // Check specific element styling
  const cardBackground = await page.evaluate(() => {
    const card = document.querySelector('[class*="bg-white"], [class*="bg-gray"]');
    if (card) {
      const computedStyle = window.getComputedStyle(card);
      return {
        element: card.className,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      };
    }
    return null;
  });
  console.log('Card styling:', cardBackground);
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'dark-mode-debug.png', fullPage: true });
  
  console.log('Debug screenshot saved to: dark-mode-debug.png');
});