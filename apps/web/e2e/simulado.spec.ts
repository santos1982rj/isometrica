import { test, expect } from '@playwright/test'

const LOGIN_URL = '/entrar'
const ALUNO = { email: 'aluno@isometrica.com', senha: '123456' }

test.describe('Simulado/Prova', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  })

  test('acessa modo concurso e visualiza simulados disponíveis', async ({ page }) => {
    await page.goto('/concurso')
    await expect(page.getByRole('heading', { name: 'Modo Concurso' })).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('ENADE').first()).toBeVisible({ timeout: 8000 })
  })

  test('inicia simulado e visualiza questões com alternativas', async ({ page }) => {
    await page.goto('/concurso')
    await expect(page.getByRole('heading', { name: 'Modo Concurso' })).toBeVisible({ timeout: 8000 })

    const primeiroCard = page.locator('[data-testid^="simulado-card-"]').first()
    await expect(primeiroCard).toBeVisible({ timeout: 8000 })
    await primeiroCard.click()

    await page.waitForURL(/\/concurso\/.+\/prova\//, { timeout: 15000 })
    await expect(page.getByText('Questão').or(page.locator('[class*="question"]'))).toBeVisible({ timeout: 8000 })
  })
})
