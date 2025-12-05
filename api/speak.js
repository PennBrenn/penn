export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY; // Securely load from Vercel
  const voiceId = "ElVDyvTtykmY2kynfxR8"; // William Voice

  if (!text || text.length > 100) {
    return res.status(400).json({ error: 'Text invalid or too long' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    // Get the audio buffer
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Return the audio file directly to the browser
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioArrayBuffer));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
