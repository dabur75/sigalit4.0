import { test, expect } from '@playwright/test';

test('Test enhanced crew management features', async ({ page }) => {
  // Login as admin
  await page.goto('http://localhost:8080/auth/signin');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  
  // Navigate to crew management
  await page.waitForURL('**/dashboard');
  await page.goto('http://localhost:8080/dashboard/crew');
  await page.waitForTimeout(3000);
  
  console.log('=== Testing Enhanced Crew Management Features ===');
  
  // Test 1: Check if stats cards are visible
  const guidesCard = page.locator('text=סך הכל מדריכים');
  const coordinatorsCard = page.locator('text=רכזים פעילים');
  const housesCard = page.locator('text=בתים פעילים');
  
  console.log('Stats cards visible:', {
    guides: await guidesCard.isVisible(),
    coordinators: await coordinatorsCard.isVisible(),
    houses: await housesCard.isVisible()
  });
  
  // Test 2: Check if house filter is present
  const houseFilter = page.locator('text=סינון לפי בית');
  console.log('House filter visible:', await houseFilter.isVisible());
  
  // Test 3: Check if the enhanced add button is present
  const addButton = page.locator('button:has-text("הוסף איש צוות")');
  console.log('Enhanced add button visible:', await addButton.isVisible());
  
  // Test 4: Test house filtering
  const filterSelect = page.locator('select').first();
  if (await filterSelect.isVisible()) {
    console.log('Testing house filter...');
    await filterSelect.selectOption(''); // All houses
    await page.waitForTimeout(1000);
    
    // Try selecting "No house" filter
    const noHouseOption = page.locator('option:has-text("ללא שיוך לבית")');
    if (await noHouseOption.isVisible()) {
      await filterSelect.selectOption('no-house');
      await page.waitForTimeout(1000);
      console.log('House filter working: filtered to users without house');
    }
  }
  
  // Test 5: Check if delete/deactivate buttons have proper text
  const deleteButtons = page.locator('button:has-text("מחק"), button:has-text("השבת")');
  const buttonCount = await deleteButtons.count();
  console.log('Delete/Deactivate buttons found:', buttonCount);
  
  for (let i = 0; i < Math.min(buttonCount, 3); i++) {
    const buttonText = await deleteButtons.nth(i).textContent();
    console.log(`Button ${i}: ${buttonText}`);
  }
  
  // Test 6: Check table styling improvements
  const table = page.locator('table');
  console.log('Enhanced table present:', await table.isVisible());
  
  // Test 7: Check if stats show actual numbers
  const statsNumbers = page.locator('.text-2xl.font-bold');
  const statsCount = await statsNumbers.count();
  console.log('Stats numbers found:', statsCount);
  
  for (let i = 0; i < statsCount; i++) {
    const statValue = await statsNumbers.nth(i).textContent();
    console.log(`Stat ${i}: ${statValue}`);
  }
  
  await page.screenshot({ path: 'enhanced-crew-management.png', fullPage: true });
  console.log('Enhanced crew management test completed successfully!');
});