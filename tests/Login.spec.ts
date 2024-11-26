require('dotenv').config(); 
const { test, expect } = require('@playwright/test');

let page;
const email = process.env.EMAIL; 
const pass = process.env.PASSWORD;

test.describe('Login', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('Login', async () => {
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/registration');
    await page.getByRole('link', { name: 'Login' }).click()
    await expect(page).toHaveURL('/login');

    await page.getByPlaceholder('Email').fill(email)
    await page.getByPlaceholder('Your password').fill(pass)

    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await page.route('https://api.university.engenious.io/auth/login', async (route, request) => {
      const body = request.postDataJSON();
      expect(body.email).toBe(email);
      expect(body.password).toBe(pass);
      route.continue();
    });

    const response = await page.waitForResponse('https://api.university.engenious.io/auth/login');
    expect(response.status()).toBe(201);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeHidden();
  });
});


