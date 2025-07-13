import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Métricas personalizadas
export let latenciaCriarLivro = new Trend('latencia_criar_livro');
export let latenciaAssociarLivro = new Trend('latencia_associar_livro');
export let taxaErro = new Rate('taxa_erro');

export let options = {
  stages: [
    { duration: '10s', target: 5 },   // aquecimento
    { duration: '30s', target: 10 },  // carga moderada
    { duration: '30s', target: 20 },  // pico de carga
    { duration: '20s', target: 0 },   // redução de carga
  ],
  thresholds: {
    'latencia_criar_livro': ['p(95)<1000'], // 95% devem responder em < 1s
    'taxa_erro': ['rate<0.05'],             // menos de 5% de erro
  },
};

const BASE_URL = 'http://localhost:8000';
const USUARIO_ID = 1;
const COLECAO_ID = 1;

function gerarLivro() {
  return {
    titulo: `Livro ${Math.random().toString(36).substring(2, 8)}`, // obrigatório
    autor_nome: "Autor Teste", // obrigatório
    categorias: ["Teste", "k6"],

    // campos opcionais que você pode omitir ou preencher:
    ano_publicacao: 1900 + Math.floor(Math.random() * 123), // opcional
    url_img: "http://exemplo.com/imagem.jpg",               // opcional
    descricao: "Livro gerado para teste de performance."    // opcional
  };
}

export default function () {
  group('📚 Criar e associar livro', () => {
    // 1. Criar livro
    let payload = JSON.stringify(gerarLivro());
    let headers = { 'Content-Type': 'application/json' };

    let resCriar = http.post(`${BASE_URL}/usuarios/${USUARIO_ID}/livros/`, payload, { headers });

    latenciaCriarLivro.add(resCriar.timings.duration);
    taxaErro.add(resCriar.status !== 201);

    check(resCriar, {
      '✅ status 201 criar': (r) => r.status === 201,
      '✅ contém id': (r) => !!r.json('id'),
    });

    if (resCriar.status !== 201) return;

    let livroId = resCriar.json('id');

    // 2. Associar livro à coleção
    let resAssociar = http.post(`${BASE_URL}/colecoes/${COLECAO_ID}/livros/${livroId}`);

    latenciaAssociarLivro.add(resAssociar.timings.duration);
    taxaErro.add(resAssociar.status !== 204);

    check(resAssociar, {
      '✅ status 204 associar': (r) => r.status === 204,
    });

    sleep(randomIntBetween(1, 2));
  });
}