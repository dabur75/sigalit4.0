import { test, expect } from '@playwright/test';

test('Force light mode and inspect', async ({ page }) => {
  // Go to signin page
  await page.goto('http://localhost:8080/auth/signin');
  
  console.log('=== FORCE LIGHT MODE INSPECTION ===');
  
  // Check if dark class is anywhere
  const htmlElement = await page.locator('html').first();
  const htmlClasses = await htmlElement.getAttribute('class');
  console.log('HTML classes:', htmlClasses);
  
  // Force remove any dark classes
  await page.evaluate(() => {
    // Remove dark class from html
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    
    // Remove dark class from body
    document.body.classList.remove('dark');
    
    // Add light classes explicitly
    document.documentElement.classList.add('light');
    document.body.classList.add('light', 'bg-white', 'text-gray-900');
    
    console.log('Forced light mode classes applied');
  });
  
  // Check styles after forcing
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const computedBodyStyle = window.getComputedStyle(body);
    const computedHtmlStyle = window.getComputedStyle(html);
    
    return {
      htmlClasses: html.className,
      bodyClasses: body.className,
      bodyBackgroundColor: computedBodyStyle.backgroundColor,
      bodyColor: computedBodyStyle.color,
      htmlBackgroundColor: computedHtmlStyle.backgroundColor,
      colorScheme: computedBodyStyle.colorScheme
    };
  });
  
  console.log('Styles after forcing light mode:', bodyStyles);
  
  // Take screenshot
  await page.screenshot({ path: 'forced-light-mode.png', fullPage: true });
  console.log('Screenshot saved: forced-light-mode.png');
});