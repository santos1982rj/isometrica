import { test, expect } from '@playwright/test'

const LOGIN_URL = '/entrar'
const ALUNO = { email: 'aluno@isometrica.com', senha: '123456' }

test.describe('Ownership', () => {
  test('aluno não acessa rota de gestão de curso - redireciona para acesso negado', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.goto('/professor/cursos/novo')
    await page.waitForURL(/\/nao-autorizado/, { timeout: 8000 })
    await expect(page.locator('h1:has-text("Acesso Negado")')).toBeVisible()
  })

  test('aluno não acessa concursos do professor - redireciona para acesso negado', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.goto('/professor/concursos')
    await page.waitForURL(/\/nao-autorizado/, { timeout: 8000 })
    await expect(page.locator('h1:has-text("Acesso Negado")')).toBeVisible()
  })
})
