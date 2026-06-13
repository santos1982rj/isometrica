import { test, expect } from '@playwright/test'

const LOGIN_URL = '/entrar'
const ALUNO = { email: 'aluno@isometrica.com', senha: '123456' }
const PROFESSOR = { email: 'professor@isometrica.com', senha: '123456' }
const ADMIN = { email: 'admin@isometrica.com', senha: '123456' }

test.describe('Autenticação', () => {
  test('login com aluno válido redireciona para dashboard', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.locator('h1')).toContainText(/Bom dia|Boa tarde|Boa noite/)
  })

  test('login com credenciais inválidas permanece na página e mostra feedback', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', 'invalido@email.com')
    await page.fill('#senha', 'senhaerrada')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/Email|senha|inválido/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('logout funciona e redireciona para login', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.click('button[aria-label="Sair"]')
    await page.waitForURL(/\/entrar/, { timeout: 10000 })
    await expect(page.getByText('Entrar').first()).toBeVisible()
  })

  test('acesso a área protegida sem login redireciona para login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/entrar/, { timeout: 10000 })
    await expect(page.getByText('Entrar').first()).toBeVisible()
  })

  test('aluno não acessa área do professor - redireciona para acesso negado', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.goto('/professor/dashboard')
    await page.waitForURL(/\/nao-autorizado/, { timeout: 8000 })
    await expect(page.getByRole('heading', { name: 'Acesso Negado' })).toBeVisible()
  })

  test('aluno não acessa área admin - redireciona para acesso negado', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ALUNO.email)
    await page.fill('#senha', ALUNO.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.goto('/admin/dashboard')
    await page.waitForURL(/\/nao-autorizado/, { timeout: 8000 })
    await expect(page.getByRole('heading', { name: 'Acesso Negado' })).toBeVisible()
  })

  test('professor não acessa área admin - redireciona para acesso negado', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', PROFESSOR.email)
    await page.fill('#senha', PROFESSOR.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/professor\/dashboard/, { timeout: 10000 })
    await page.goto('/admin/dashboard')
    await page.waitForURL(/\/nao-autorizado/, { timeout: 8000 })
    await expect(page.getByRole('heading', { name: 'Acesso Negado' })).toBeVisible()
  })

  test('admin acessa área admin', async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.fill('#email', ADMIN.email)
    await page.fill('#senha', ADMIN.senha)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
  })
})
