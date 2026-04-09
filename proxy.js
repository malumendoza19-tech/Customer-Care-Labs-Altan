// Netlify Function — proxy seguro para el simulador Altán Skills Lab
// La API key vive aquí en el servidor, nunca en el navegador del usuario.

exports.handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Leer la API key desde las variables de entorno de Netlify
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set in environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: 'Servicio no configurado. Contacta al administrador.' } })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: { message: 'Request inválido' } }) };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      body.model      || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 2000,
        system:     body.system,
        messages:   body.messages,
      }),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Proxy error:', err);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: { message: 'Error de conexión. Intenta de nuevo.' } })
    };
  }
};
