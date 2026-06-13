import { test, expect } from '@playwright/test'

test.describe('Sanidade visual e navegação', () => {
  test('página de login carrega sem erro', async ({ page }) => {
    await page.goto('/entrar')
    await expect(page.getByText('Entrar').first()).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#senha')).toBeVisible()
  })

  test('página de cadastro carrega sem erro', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.getByText('Criar Conta').first()).toBeVisible({ timeout: 8000 })
  })

  test('página de recuperar senha carrega', async ({ page }) => {
    await page.goto('/esqueceu-senha')
    await expect(page.getByText('Recuperar').first()).toBeVisible({ timeout: 8000 })
  })

  test('landing page carrega sem erro', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible({ timeout: 8000 })
  })

  test('404 retorna fallback com mensagem', async ({ page }) => {
    await page.goto('/rota-inexistente')
    await expect(page.getByText(/não encontrada|404/).or(page.locator('h1'))).toBeVisible({ timeout: 8000 })
  })
})
