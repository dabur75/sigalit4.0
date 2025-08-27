import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sign-in page
    await page.goto('/auth/signin');
  });

  test('should display the sign-in page correctly', async ({ page }) => {
    // Check page title and form elements
    await expect(page.getByText('ברוכים הבאים ל-Sigalit')).toBeVisible();
    await expect(page.getByText('מערכת ניהול שיבוצים')).toBeVisible();
    
    // Check form fields
    await expect(page.getByLabel('שם משתמש')).toBeVisible();
    await expect(page.getByLabel('סיסמה')).toBeVisible();
    await expect(page.getByRole('button', { name: 'התחבר' })).toBeVisible();
    
    // Check example credentials are shown
    await expect(page.getByText('admin / admin123')).toBeVisible();
    await expect(page.getByText('coordinator1 / coordinator123')).toBeVisible();
    await expect(page.getByText('guide1 / guide123')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Try to login with invalid credentials
    await page.getByLabel('שם משתמש').fill('invalid_user');
    await page.getByLabel('סיסמה').fill('wrong_password');
    await page.getByRole('button', { name: 'התחבר' }).click();
    
    // Check for error message
    await expect(page.getByText('שם המשתמש או הסיסמה שגויים')).toBeVisible();
  });

  test('should successfully login as admin', async ({ page }) => {
    // Fill in admin credentials
    await page.getByLabel('שם משתמש').fill('admin');
    await page.getByLabel('סיסמה').fill('admin123');
    
    // Click login button
    await page.getByRole('button', { name: 'התחבר' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check if dashboard content is visible
    await expect(page.getByText('לוח הבקרה')).toBeVisible();
  });

  test('should successfully login as coordinator', async ({ page }) => {
    // Fill in coordinator credentials
    await page.getByLabel('שם משתמש').fill('coordinator1');
    await page.getByLabel('סיסמה').fill('coordinator123');
    
    // Click login button
    await page.getByRole('button', { name: 'התחבר' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check if dashboard content is visible
    await expect(page.getByText('לוח הבקרה')).toBeVisible();
  });

  test('should successfully login as guide', async ({ page }) => {
    // Fill in guide credentials
    await page.getByLabel('שם משתמש').fill('guide1');
    await page.getByLabel('סיסמה').fill('guide123');
    
    // Click login button
    await page.getByRole('button', { name: 'התחבר' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check if dashboard content is visible
    await expect(page.getByText('לוח הבקרה')).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    // Fill in credentials
    await page.getByLabel('שם משתמש').fill('admin');
    await page.getByLabel('סיסמה').fill('admin123');
    
    // Click login and immediately check for loading state
    await page.getByRole('button', { name: 'התחבר' }).click();
    
    // The button text should change to loading state briefly
    await expect(page.getByRole('button', { name: 'מתחבר...' })).toBeVisible();
  });

  test('should handle empty credentials', async ({ page }) => {
    // Try to submit without filling anything
    await page.getByRole('button', { name: 'התחבר' }).click();
    
    // HTML5 validation should prevent submission
    // The username field should be focused and show validation
    await expect(page.getByLabel('שם משתמש')).toBeFocused();
  });

  test('should handle RTL text input correctly', async ({ page }) => {
    const usernameField = page.getByLabel('שם משתמש');
    const passwordField = page.getByLabel('סיסמה');
    
    // Check RTL attributes
    await expect(usernameField).toHaveAttribute('dir', 'rtl');
    await expect(passwordField).toHaveAttribute('dir', 'rtl');
    
    // Fill fields and verify content
    await usernameField.fill('admin');
    await passwordField.fill('admin123');
    
    await expect(usernameField).toHaveValue('admin');
    await expect(passwordField).toHaveValue('admin123');
  });
});