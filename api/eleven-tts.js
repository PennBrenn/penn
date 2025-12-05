// api/eleven-tts.js
export const config = { runtime: 'edge' };

const PROFANITY = ["fuck","shit","bitch","cunt","nigger","faggot","asshole"]; // server-side sample list; extend as needed

function containsProfanity(s){
  if(!s) return false;
  const lower = s.toLowerCase();
  return PROFANITY.some(p => lower.includes(p));
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') return new Response('Bad request', { status:400 });
    if (text.length > 100) return new Response('Text exceeds 100 characters', { status: 400 });
    if (containsProfanity(text)) return new Response('Profanity not allowed', { status: 403 });

    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVEN_KEY) return new Response('Server misconfigured: missing ELEVENLABS_API_KEY', { status:500 });

    // VOICE ID: replace with your preferred voice ID. Example "William J" id shown publicly.
    const VOICE_ID = 'ElVDyvTtykmY2kynfxR8'; // optional: replace with your own voice id

    // ElevenLabs stream endpoint
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

    const payload = {
      text: text,
      // optional: you can add model, voice settings etc. Check ElevenLabs docs if you want advanced options.
    };

    const fetchResp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload)
    });

    if (!fetchResp.ok) {
      const bodyText = await fetchResp.text();
      return new Response(bodyText || 'ElevenLabs error', { status: fetchResp.status });
    }

    // Proxy the audio stream back to the client
    const headers = {
      'Content-Type': fetchResp.headers.get('content-type') || 'audio/mpeg',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    };

    return new Response(fetchResp.body, { status: 200, headers });
  } catch (err) {
    return new Response('Server error', { status: 500 });
  }
}
