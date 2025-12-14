import { test, expect } from '@playwright/test';

/**
 * Learning Progress Tracker - E2E Tests
 */

test.describe('Milestone Completion', () => {
  test.skip('should mark a milestone as complete', async ({ page }) => {
    await page.goto('/goals/1');
    await page.waitForSelector('[data-testid^="milestone-"]');
    const milestoneCheckbox = page.locator('[data-testid^="milestone-checkbox-"]').first();
    await milestoneCheckbox.click();
    await page.waitForTimeout(500);
    const milestoneItem = page.locator('[data-testid^="milestone-"]').first();
    await expect(milestoneItem).toHaveClass(/milestoneCompleted/);
  });
});

test.describe('Landing Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Track Your Learning');
    const googleButton = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible();
    // Use getByRole for specific heading elements to avoid ambiguity
    await expect(page.getByRole('heading', { name: 'Set Learning Goals' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Track Milestones' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Visualize Progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Discover Courses' })).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Learning Progress Tracker/);
  });

  test('should display CTA button', async ({ page }) => {
    await page.goto('/');
    const ctaButton = page.getByRole('button', { name: /Get Started Free/i });
    await expect(ctaButton).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should redirect unauthenticated users to landing', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });

  test('should redirect unauthenticated users from goals page', async ({ page }) => {
    await page.goto('/goals');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Accessibility', () => {
  test('landing page should have no obvious accessibility issues', async ({ page }) => {
    await page.goto('/');
    const googleButton = page.getByRole('button', { name: /Continue with Google/i });
    await googleButton.focus();
    await expect(googleButton).toBeFocused();
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('text=LearnTrack').first()).toBeVisible();
    const googleButton = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('API Integration', () => {
  test.skip('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
