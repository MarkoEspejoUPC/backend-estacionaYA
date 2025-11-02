module.exports = {
  success: (body) => ({
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  created: (body) => ({
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  error: (msg, code = 500) => ({
    statusCode: code,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: msg })
  })
};
