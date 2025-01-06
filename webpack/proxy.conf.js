function setupProxy({ tls }) {
  const serverResources = ['/api', '/services', '/management', '/v3/api-docs', '/h2-console', '/auth', '/oauth2', '/login', '/health', '/websocket'];
  const conf = [
    {
      context: serverResources,
      target: `http${tls ? 's' : ''}://localhost:${process.env.NODE_ENV === 'production' ? '9000' : '8080'}`,
      secure: false,
      changeOrigin: tls,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:4040',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
    },
  ];
  return conf;
}

module.exports = setupProxy;
