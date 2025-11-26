const http = require('http');
const https = require('https');

const PORT = 3000;
const N8N_WEBHOOK_URL = 'https://n8n.dpgtestbed.kr/webhook-test/73f34187-b08f-48fa-960d-ba9ead6c80f7/webhook';

http.createServer((req, res) => {
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 (preflight) 처리
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`📨 요청 받음: ${req.method} ${req.url}`);

  // n8n으로 프록시
  const options = {
    method: req.method,
    headers: req.headers
  };

  const proxyReq = https.request(N8N_WEBHOOK_URL, options, (proxyRes) => {
    console.log(`✅ n8n 응답: ${proxyRes.statusCode}`);

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('❌ 프록시 에러:', err);
    res.writeHead(500);
    res.end('Proxy error');
  });

  req.pipe(proxyReq);
}).listen(PORT, () => {
  console.log(`🚀 프록시 서버 실행 중: http://localhost:${PORT}`);
});
