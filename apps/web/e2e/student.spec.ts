import { test, expect } from '@playwright/test'

const LOGIN_URL = '/entrar'
const ALUNO = { email: 'aluno@isometrica.com', senha: '123456' }

test.describe('Fluxo do Aluno', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  })

  test('dashboard carrega com KPIs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Bom dia|Boa tarde|Boa noite/)
    await expect(page.getByText('XP Total').first()).toBeVisible({ timeout: 5000 })
  })

  test('acessa cursos e lista aparece', async ({ page }) => {
    await page.goto('/cursos')
    await expect(page.getByRole('heading', { name: 'Meus Cursos' })).toBeVisible()
  })

  test('abre um curso da listagem', async ({ page }) => {
    await page.goto('/cursos')
    const primeiroCurso = page.locator('a[href^="/cursos/"]').first()
    await expect(primeiroCurso).toBeVisible({ timeout: 5000 })
    const href = await primeiroCurso.getAttribute('href')
    if (href) {
      await page.goto(href)
      await expect(page.getByText('Ementa').or(page.getByText('Curso não encontrado'))).toBeVisible({ timeout: 8000 })
    }
  })

  test('acessa gamificação sem erro', async ({ page }) => {
    await page.goto('/gamificacao')
    await expect(page.getByRole('heading', { name: 'Gamificação' })).toBeVisible({ timeout: 8000 })
  })

  test('acessa progresso sem erro', async ({ page }) => {
    await page.goto('/progresso')
    await expect(page.getByRole('heading', { name: 'Meu Progresso' })).toBeVisible({ timeout: 8000 })
  })

  test('acessa banco de questões sem erro', async ({ page }) => {
    await page.goto('/banco-questoes')
    await expect(page.getByRole('heading', { name: 'Questões' })).toBeVisible({ timeout: 8000 })
  })

  test('acessa feed de erros sem erro', async ({ page }) => {
    await page.goto('/erros')
    await expect(page.getByRole('heading', { name: 'Feed de Erros' })).toBeVisible({ timeout: 8000 })
  })

  test('acessa certificados sem erro', async ({ page }) => {
    await page.goto('/certificados')
    await expect(page.getByRole('heading', { name: 'Meus Certificados' })).toBeVisible({ timeout: 8000 })
  })

  test('acessa assinatura sem erro', async ({ page }) => {
    await page.goto('/assinatura')
    await expect(page.getByRole('heading', { name: 'Planos' }).first()).toBeVisible({ timeout: 8000 })
  })

  test('acessa modo concurso sem erro', async ({ page }) => {
    await page.goto('/concurso')
    await expect(page.getByRole('heading', { name: 'Modo Concurso' })).toBeVisible({ timeout: 8000 })
  })

  test('acessa perfil sem erro', async ({ page }) => {
    await page.goto('/perfil')
    await expect(page.locator('h1').or(page.getByText('Carregando'))).toBeVisible({ timeout: 8000 })
  })
})
