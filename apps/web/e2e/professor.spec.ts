import { test, expect } from '@playwright/test'

const LOGIN_URL = '/entrar'
const PROFESSOR = { email: 'professor@isometrica.com', senha: '123456' }

test.describe('Fluxo do Professor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', PROFESSOR.email)
    await page.fill('#senha', PROFESSOR.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/professor\/dashboard/, { timeout: 10000 })
  })

  test('dashboard do professor carrega', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Bem-vindo, Prof/)
  })

  test('acessa meus cursos', async ({ page }) => {
    await page.goto('/professor/cursos')
    await expect(page.getByRole('heading', { name: 'Meus Cursos' })).toBeVisible({ timeout: 8000 })
  })

  test('sidebar professor tem opções corretas', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Meus Cursos')).toBeVisible()
    await expect(page.getByText('Criar Curso')).toBeVisible()
    await expect(page.getByText('Concursos').first()).toBeVisible()
  })

  test('professor não acessa admin - redireciona para acesso negado', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForURL(/\/nao-autorizado/, { timeout: 8000 })
    await expect(page.getByRole('heading', { name: 'Acesso Negado' })).toBeVisible()
  })
})
