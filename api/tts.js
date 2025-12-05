// api/elevenlabs-tts.js
// Vercel Serverless Function (Node runtime)
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = await req.json();
    let text = (body && body.text) ? String(body.text).slice(0, 100) : '';
    if (!text || text.trim().length === 0) {
      return res.status(400).send('Text required (<=100 chars).');
    }

    // voice id "william"
    const VOICE_ID = 'william';
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!API_KEY) {
      console.error('Missing ELEVENLABS_API_KEY');
      return res.status(500).send('Server misconfigured');
    }

    // ElevenLabs TTS endpoint (stream)
    const elevenURL = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE_ID)}/stream`;

    const elevenRes = await fetch(elevenURL, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY
      },
      body: JSON.stringify({ text })
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text().catch(()=> 'no body');
      console.error('ElevenLabs error', elevenRes.status, errText);
      return res.status(502).send('TTS provider error');
    }

    // stream back the audio
    const arrayBuffer = await elevenRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
