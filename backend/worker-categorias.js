require('dotenv').config({ path: __dirname + '/.env' });
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const APP_ID = process.env.SHOPEE_APP_ID;
const SECRET = process.env.SHOPEE_SECRET;
const DB_FILE = path.join(__dirname, 'catalogo.json');

// Lista de categorias para buscar
const TERMOS_BUSCA = [
    "capa de celular", "pelicula de vidro", "carregador turbo", "cabo tipo c", 
    "fone de ouvido", "headset gamer", "caixa de som bluetooth", "microfone",
    "smartwatch", "pulseira inteligente", "suporte de celular", "power bank",
    "camiseta algodao", "bermuda masculina", "calca jeans feminina", "legging fitness",
    "top fitness", "conjunto de lingerie", "cueca boxer", "meia",
    "vestido longo", "vestido curto", "blusa de frio", "jaqueta corta vento",
    "tenis corrida", "sandalia salto", "chinelo", "sapato social",
    "bolsa feminina", "mochila notebook", "carteira masculina", "cinto",
    "bone", "oculos de sol", "relogio masculino", "brinco de prata",
    "colar de ouro", "anel", "pulseira", "kit maquiagem",
    "base liquida", "po compacto", "mascara de cílios", "delineador",
    "batom matte", "gloss labial", "perfume importado", "creme hidratante",
    "shampoo anticaspa", "condicionador", "sabonete facial", "protetor solar",
    "panela antiaderente", "jogo de facas", "tabua de corte", "utensilios cozinha",
    "air fryer", "liquidificador", "batedeira", "cafeteira",
    "jogo de lencol", "fronha", "cobertor", "edredom",
    "toalha de banho", "tapete de banheiro", "cortina", "organizador de armario",
    "luminaria led", "lampada inteligente", "fita led", "extensao eletrica",
    "robo aspirador", "aspirador portatil", "ventilador", "umidificador",
    "teclado mecanico", "mouse sem fio", "mousepad", "cadeira gamer",
    "monitor", "webcam", "hub usb", "hd externo",
    "racao para cachorro", "petisco para gato", "coleira antipulgas", "cama pet",
    "brinquedo pet", "comedouro automatico", "areia sanitaria", "tapete higienico",
    "brinquedo educativo", "quebra cabeca", "boneca", "carrinho de controle remoto",
    "jogo de tabuleiro", "massinha", "piscina inflavel", "bola",
    "halter", "faixa elastica", "corda de pular", "whey protein",
    "creatina", "pre treino", "garrafa termica", "coqueteleira",
    "chave de fenda", "alicate", "furadeira", "parafusadeira",
    "trena", "martelo", "kit ferramentas", "fita isolante",
    "papelaria", "caderno", "caneta colorida", "mochila escolar",
    "estojo", "marca texto", "agenda", "calculadora",
    "guarda chuva", "sombrinha", "capa de chuva", "oculos de protecao",
    "mascara de pano", "alcool em gel", "termometro digital", "oximetro",
    "suporte de monitor", "apoio de pe", "descanso de pulso", "fita adesiva"
];

let termoAtual = 0;
let paginaAtual = 1;
let paginasVazias = 0;
const SORT_TYPES = [2, 3, 4, 5]; // 2=Vendidos, 3=Novidades, 4=Preço Asc, 5=Preço Desc
let sortAtual = 0;

async function buscarProdutos() {
    if (!APP_ID || !SECRET) return console.log("❌ Chaves não configuradas.");

    const termo = TERMOS_BUSCA[termoAtual];
    const sortDinamico = SORT_TYPES[sortAtual]; console.log(`\n🤖 [Categoria] Buscando "${termo}" (Ordenação: ${sortDinamico}) - Pág ${paginaAtual}...`);
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = JSON.stringify({
        query: `query { productOfferV2(listType: 0, sortType: ${sortDinamico}, page: ${paginaAtual}, limit: 20, keyword: "${termo}") { nodes { itemId productName priceMin imageUrl offerLink commissionRate ratingStar } } }`
    });

    const signature = crypto.createHash('sha256').update(APP_ID + timestamp + payload + SECRET).digest('hex');

    try {
        const response = await fetch('https://open-api.affiliate.shopee.com.br/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`
            },
            body: payload
        });

        const data = await response.json();

        if (data.errors) {
            console.log(`⚠️ Erro na API. Esperando 60s...`);
            setTimeout(buscarProdutos, 60000);
            return;
        }

        const produtos = data.data?.productOfferV2?.nodes || [];
        
        if (produtos.length === 0) {
            console.log(`🏁 Fim dos produtos para "${termo}". Mudando de categoria...`);
            proximaBusca();
            return;
        }

        let catalogo = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) : [];
        let adicionados = 0;

        produtos.forEach(prod => {
            if (!catalogo.find(p => String(p.itemId) === String(prod.itemId))) {
                prod.productName = prod.productName.replace(/[\r\n\t]/g, ' ').trim();
                const nome = prod.productName.toLowerCase();
                let cat = "Novidades";
                if (nome.match(/plus size|vestido|blusa|calça|saia|short/)) cat = "Moda Plus Size";
                else if (nome.match(/fone|celular|smartwatch|carregador|led|tv/)) cat = "Eletrônicos";
                else if (nome.match(/panela|cozinha|copo|prato|airfryer/)) cat = "Cozinha";
                else if (nome.match(/guarda-chuva|sombrinha/)) cat = "Guarda-Chuvas";
                else if (nome.match(/cama|sofá|mesa|cadeira/)) cat = "Móveis";

                catalogo.push({ ...prod, categoria: cat });
                adicionados++;
            }
        });

        if (adicionados > 0) {
            fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(catalogo, null, 2));
            fs.renameSync(DB_FILE + '.tmp', DB_FILE);
            console.log(`✅ SALVOU! +${adicionados} novos. Total: ${catalogo.length}`);
            paginasVazias = 0; // Zera o contador
        } else {
            console.log(`ℹ️ Sem novidades.`);
            paginasVazias++; // Incrementa o contador
        }

        paginaAtual++; 
        
        // Se ficou 3 páginas seguidas sem novidades, pula para a próxima categoria
        if (paginasVazias >= 15 || paginaAtual > 30) {
            proximaBusca();
        } else {
            setTimeout(buscarProdutos, 1000); // Pausa de 3s
        }

    } catch (e) {
        console.error(`❌ Erro de rede: ${e.message}. Esperando 30s...`);
        setTimeout(buscarProdutos, 30000);
    }
}

function proximaBusca() {
    termoAtual++;
    paginaAtual = 1;
    paginasVazias = 0;
    
    if (termoAtual >= TERMOS_BUSCA.length) {
        termoAtual = 0;
        console.log("🔄 Reiniciando a lista de categorias em 3 minutos...");
        setTimeout(buscarProdutos, 180000); // Espera 3 min para buscar novidades
    } else {
        setTimeout(buscarProdutos, 2000);
    }
}

console.log("🚀 GARIMPEIRO DE CATEGORIAS INICIADO!");
buscarProdutos();
