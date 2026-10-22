require('dotenv').config();
const express = require('express');
const { createClient } = require('@tursodatabase/serverless/compat');
const app = express();
const PORT = process.env.PORT || 3001;

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// ====================================================================
// 🛡️ REDIRECIONADOR 301 PARA URLS ANTIGAS
// ====================================================================
app.use((req, res, next) => {
    const matchAntigo = req.path.match(/\/ofertas\/.*-(\d+)\.html/);
    if (matchAntigo) {
        return res.redirect(301, `/produto.html?id=${matchAntigo[1]}`);
    }
    next();
});

// ====================================================================
// 🗺️ SITEMAP INDEX (O arquivo mestre)
// ====================================================================
app.get('/sitemap.xml', async (req, res) => {
    const totalProdutos = 10092843;
    const limitePorSitemap = 50000;
    const totalSitemaps = Math.ceil(totalProdutos / limitePorSitemap);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (let i = 1; i <= totalSitemaps; i++) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>https://osachadinhosdashopee.com.br/sitemap-page-${i}.xml</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `  </sitemap>\n`;
    }
    
    xml += '</sitemapindex>';
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
});

// TRUQUE DE MESTRE: Se o Google pedir com barra no final, redireciona para sem barra
app.get('/sitemap.xml/', (req, res) => {
    res.redirect(301, '/sitemap.xml');
});

// ====================================================================
// 🗺️ SITEMAP PAGES (Os pedaços de 50 mil links)
// ====================================================================
app.get('/sitemap-page-:page.xml', async (req, res) => {
    const page = parseInt(req.params.page);
    const offset = (page - 1) * 50000;

    try {
        const result = await db.execute({
            sql: 'SELECT id FROM produtos LIMIT 50000 OFFSET ?',
            args: [offset]
        });

        if (result.rows.length === 0) {
            return res.status(404).send('Sitemap não encontrado');
        }

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        result.rows.forEach(row => {
            xml += `  <url>\n`;
            xml += `    <loc>https://osachadinhosdashopee.com.br/produto.html?id=${row.id}</loc>\n`;
            xml += `  </url>\n`;
        });

        xml += '</urlset>';
        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// ====================================================================
// APIs DO CATÁLOGO
// ====================================================================
app.get('/api/catalogo', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const cat = req.query.cat;
    const q = req.query.q;

    let query = 'SELECT * FROM produtos';
    let params = [];
    let conditions = [];

    if (cat && cat !== 'Todos') { conditions.push('categoria = ?'); params.push(cat); }
    if (q) { conditions.push('titulo LIKE ?'); params.push(`%${q}%`); }
    if (conditions.length > 0) { query += ' WHERE ' + conditions.join(' AND '); }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
        const result = await db.execute({ sql: query, args: params });
        const formatado = result.rows.map(p => ({
            itemId: p.id, titulo: p.titulo, preco: p.preco, imagem: p.imagem, link_afiliado: p.link, categoria: p.categoria, hashtags: p.hashtags
        }));
        res.json(formatado);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/produto/:id', async (req, res) => {
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM produtos WHERE id = ?',
            args: [req.params.id]
        });
        const p = result.rows[0];
        if (p) res.json({ itemId: p.id, titulo: p.titulo, preco: p.preco, imagem: p.imagem, link_afiliado: p.link, categoria: p.categoria, hashtags: p.hashtags });
        else res.status(404).json({ error: "Produto não encontrado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const result = await db.execute('SELECT count(*) as total FROM produtos');
        res.json({ total: result.rows[0].total });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`🚀 API Nuvem com Sitemap Blindado na porta ${PORT}!`));
