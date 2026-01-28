export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  console.log('Webhook recibido:', req.body);

  return res.status(200).json({
    status: 'ok',
    received: req.body
  });
}
