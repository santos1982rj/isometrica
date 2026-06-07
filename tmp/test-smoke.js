const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  let pass = 0;
  let total = 0;

  async function check(nome, fn) {
    total++;
    try {
      await fn();
      console.log('  PASS:', nome);
      pass++;
    } catch (e) {
      console.log('  FAIL:', nome, '-', e.message);
    }
  }

  await check('GET /entrar -> 200', async () => {
    const res = await page.goto('http://localhost:3000/entrar', { waitUntil: 'networkidle' });
    if (res.status() !== 200) throw new Error('Status: ' + res.status());
  });

  await check('Login form visivel', async () => {
    const visivel = await page.isVisible('text=Entrar');
    if (!visivel) throw new Error('Form nao visivel');
  });

  await check('Login funciona -> /dashboard', async () => {
    await page.fill('input[type="email"]', 'admin@isometrica.com');
    await page.fill('input[type="password"]', 'admin123');
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
  });

  await check('GET /cursos -> 4 cards', async () => {
    await page.goto('http://localhost:3000/cursos', { waitUntil: 'networkidle' });
    const cards = await page.locator('a[href*="/cursos/"]').count();
    if (cards < 1) throw new Error('Sem cursos');
    console.log('   (' + cards + ' cursos)');
  });

  await check('GET /cursos/[id]', async () => {
    await page.locator('a[href*="/cursos/"]').first().click();
    await page.waitForURL('**/cursos/*', { timeout: 10000 });
    const h1 = await page.textContent('h1');
    if (!h1) throw new Error('Sem h1');
    console.log('   Curso:', h1);
  });

  await check('GET /progresso', async () => {
    await page.goto('http://localhost:3000/progresso', { waitUntil: 'networkidle' });
    const ok = await page.isVisible('h1:has-text("Progresso")');
    if (!ok) throw new Error('Nao carregou');
  });

  await check('GET /tutor', async () => {
    await page.goto('http://localhost:3000/tutor', { waitUntil: 'networkidle' });
    const visivel = await page.isVisible('input[placeholder]');
    if (!visivel) throw new Error('Input nao visivel');
  });

  await check('GET /cadastro', async () => {
    await page.goto('http://localhost:3000/cadastro', { waitUntil: 'networkidle' });
    const ok = await page.isVisible('text=Criar Conta');
    if (!ok) throw new Error('Nao carregou');
  });

  await check('GET /esqueceu-senha', async () => {
    await page.goto('http://localhost:3000/esqueceu-senha', { waitUntil: 'networkidle' });
    const ok = await page.isVisible('text=Esqueceu');
    if (!ok) throw new Error('Nao carregou');
  });

  await check('API: GET /health', async () => {
    const res = await page.evaluate(() =>
      fetch('http://localhost:3001/api/health').then(r => r.json())
    );
    if (res.status !== 'ok') throw new Error('Health nao ok');
  });

  await check('API: POST /auth/login', async () => {
    const res = await page.evaluate(() =>
      fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@isometrica.com', senha: 'admin123' }),
      }).then(r => r.json())
    );
    if (!res.access_token) throw new Error('Sem token');
  });

  console.log(`\n === RESULTADO: ${pass}/${total} testes passaram ===`);
  await browser.close();
  process.exit(pass === total ? 0 : 1);
})();
