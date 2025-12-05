import fetch from 'node-fetch';

export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).end();
  const { text } = await req.json();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/<WILLIAM_VOICE_ID>`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json','xi-api-key': apiKey },
    body: JSON.stringify({ text })
  });
  const buffer = await response.arrayBuffer();
  res.setHeader('Content-Type','audio/mpeg');
  res.send(Buffer.from(buffer));
}
