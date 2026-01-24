
import { test, expect } from '@playwright/test';

test.describe('Shop Floor Execution Flow', () => {
    test('Complete flow: Scan -> Start -> Count -> Complete', async ({ page }) => {
        // Mock user login
        await page.addInitScript(() => {
            localStorage.setItem('mes_token', 'mock-token-123');
        });

        // 1. Operator lands on home/dashboard
        await page.goto('/');

        // 2. Scan a barcode (OP)
        // Assuming there is a global scan input or button
        const scanInput = page.getByPlaceholder('Scan barcode...');
        await scanInput.fill('OP-2024-001');
        await scanInput.press('Enter');

        // 3. Verify OP details loaded
        await expect(page.getByText('OP-2024-001')).toBeVisible();
        await expect(page.getByText('NOT_STARTED')).toBeVisible();

        // 4. Start Step 1
        await page.getByRole('button', { name: 'Start' }).click();
        await expect(page.getByText('IN_PROGRESS')).toBeVisible();

        // 5. Count Pieces
        await page.getByRole('button', { name: 'Count (+1)' }).click();
        await page.getByRole('button', { name: 'Count (+1)' }).click();
        await expect(page.getByText('Executed: 2')).toBeVisible();

        // 6. Complete Step
        await page.getByRole('button', { name: 'Complete Step' }).click();
        await expect(page.getByText('COMPLETED')).toBeVisible();
    });
});
