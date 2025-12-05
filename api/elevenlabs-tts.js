import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;
  if (!text || text.length > 100) return res.status(400).json({ error: 'Invalid input' });

  // Simple profanity filter
  const profanities = ["badword1", "badword2"]; // expand as needed
  if (profanities.some(word => text.toLowerCase().includes(word))) {
    return res.status(400).json({ error: 'Profanity not allowed' });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/<WILLIAM_VOICE_ID>', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).json({ error: 'TTS API Error' });
  }
}
