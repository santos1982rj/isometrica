import { test, expect } from '@playwright/test'

const LOGIN_URL = '/entrar'
const PROFESSOR = { email: 'professor@isometrica.com', senha: '123456' }

test.describe('Professor - Criação de Curso', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', PROFESSOR.email)
    await page.fill('#senha', PROFESSOR.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/professor\/dashboard/, { timeout: 10000 })
  })

  test('acessa página de criar curso e preenche etapa 1', async ({ page }) => {
    await page.goto('/professor/cursos/novo')
    await expect(page.getByRole('heading', { name: 'Novo Curso' })).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Dados do Curso')).toBeVisible()

    await page.fill('input[placeholder*="Resistência"]', 'Curso E2E Teste')
    await page.fill('textarea', 'Descrição do curso criado via E2E')
    await page.click('button:has-text("Próximo")')
    await expect(page.getByRole('heading', { name: 'Módulos do Curso' }).first()).toBeVisible({ timeout: 5000 })
  })

  test('navega pelo wizard até revisar', async ({ page }) => {
    await page.goto('/professor/cursos/novo')
    await expect(page.getByRole('heading', { name: 'Novo Curso' })).toBeVisible({ timeout: 8000 })

    await page.fill('input[placeholder*="Resistência"]', 'Curso Wizard E2E')
    await page.fill('textarea', 'Descrição')
    await page.click('button:has-text("Próximo")')
    await expect(page.getByRole('heading', { name: 'Módulos do Curso' }).first()).toBeVisible({ timeout: 5000 })

    await page.fill('input[placeholder*="módulo"]', 'Módulo Único')
    await page.click('button:has-text("Adicionar")')
    await expect(page.getByText('Módulo Único')).toBeVisible({ timeout: 5000 })

    await page.click('button:has-text("Próximo")')
    await expect(page.getByText('Revisar e Publicar')).toBeVisible({ timeout: 5000 })

    await page.click('button:has-text("Próximo")')
    await expect(page.getByText('Revisar e Publicar').first()).toBeVisible({ timeout: 5000 })
  })
})
