// api/tts.js
// Node.js serverless function for Vercel (CommonJS module).
// Endpoint: POST /api/tts
// Body: { text: "..." } (max 100 chars enforced client-side)
// Returns: audio/mpeg (mp3) stream from ElevenLabs
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

module.exports = async (req, res) => {
  // Only POST
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow','POST').send('Method Not Allowed');
    return;
  }

  // read API key from env var
  const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVEN_API_KEY) {
    res.status(500).send('Server misconfigured: missing ElevenLabs API key');
    return;
  }

  let body;
  try {
    body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body);
  } catch (e) {
    res.status(400).send('Invalid JSON');
    return;
  }

  const text = (body.text || '').toString().slice(0, 100); // enforce 100 chars on server too
  if (!text) {
    res.status(400).send('No text provided');
    return;
  }

  // ElevenLabs TTS convert endpoint (v1 text-to-speech)
  // Using the voice ID "william" as requested
  const voiceId = 'william';
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;

  try {
    const elevenResp = await fetch(endpoint + '?optimize_streaming_latency=0&output_format=mp3_22050_32', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_API_KEY
      },
      body: JSON.stringify({
        text,
        // optional voice settings (tweak if you like)
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7
        }
      }),
      // Important: want binary
    });

    if (!elevenResp.ok) {
      const textErr = await elevenResp.text();
      console.error('ElevenLabs error', elevenResp.status, textErr);
      res.status(502).send(`ElevenLabs API error: ${elevenResp.status} ${textErr}`);
      return;
    }

    const arrayBuffer = await elevenResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    // Optional: caching disabled for privacy
    res.setHeader('Cache-Control', 'no-store');

    res.status(200).send(buffer);
  } catch (err) {
    console.error('TTS function error', err);
    res.status(500).send('TTS generation failed');
  }
};
