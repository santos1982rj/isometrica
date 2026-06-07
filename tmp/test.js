const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  let ok = 0;
  let fail = 0;

  async function test(nome, fn) {
    try {
      await fn();
      console.log('  PASS:', nome);
      ok++;
    } catch (e) {
      console.log('  FAIL:', nome, '-', e.message.slice(0, 60));
      fail++;
    }
  }

  await test('Pagina de login carrega', async () => {
    await page.goto('http://localhost:3000/entrar', { waitUntil: 'networkidle' });
    const titulo = await page.textContent('h2');
    if (!titulo.includes('Entrar')) throw new Error('Titulo nao encontrado');
  });

  await test('Login funciona', async () => {
    await page.fill('input[type="email"]', 'admin@isometrica.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  await test('Dashboard carrega', async () => {
    const texto = await page.textContent('h1');
    if (!texto.includes('Bem-vindo')) throw new Error('Dashboard sem boas-vindas');
  });

  await test('Sidebar tem navegacao', async () => {
    const temMenu = await page.textContent('body');
    if (!temMenu.includes('Meus Cursos')) throw new Error('Sidebar sem menu');
  });

  await test('Listagem de cursos', async () => {
    await page.goto('http://localhost:3000/cursos', { waitUntil: 'networkidle' });
    const cards = await page.locator('a[href*="/cursos/"]').count();
    if (cards < 1) throw new Error('Nenhum curso encontrado: ' + cards);
  });

  await test('Detalhe do primeiro curso', async () => {
    await page.locator('a[href*="/cursos/"]').first().click();
    await page.waitForURL('**/cursos/*', { timeout: 10000 });
    const titulo = await page.textContent('h1');
    if (!titulo) throw new Error('Sem titulo do curso');
  });

  await test('Pagina de progresso', async () => {
    await page.goto('http://localhost:3000/progresso', { waitUntil: 'networkidle' });
    const h1 = await page.textContent('h1');
    if (!h1.includes('Progresso')) throw new Error('Titulo errado');
  });

  await test('Pagina do tutor IA', async () => {
    await page.goto('http://localhost:3000/tutor', { waitUntil: 'networkidle' });
    const input = await page.locator('input[placeholder*="D"]');
    const visivel = await input.isVisible();
    if (!visivel) throw new Error('Input do tutor nao visivel');
  });

  await test('Pagina de cadastro', async () => {
    await page.goto('http://localhost:3000/cadastro', { waitUntil: 'networkidle' });
    const h2 = await page.textContent('h2');
    if (!h2.includes('Criar Conta')) throw new Error('Titulo errado');
  });

  await test('Pagina esqueceu senha', async () => {
    await page.goto('http://localhost:3000/esqueceu-senha', { waitUntil: 'networkidle' });
    const h2 = await page.textContent('h2');
    if (!h2.includes('Esqueceu')) throw new Error('Titulo errado');
  });

  console.log(`\n RESULTADO: ${ok} passaram, ${fail} falharam`);
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
})();
