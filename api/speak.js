export const config = {
    runtime: 'edge', // Runs faster on Vercel
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { text } = await req.json();

        // 1. Validation
        if (!text || text.length > 100) {
            return new Response('Text must be under 100 characters.', { status: 400 });
        }


        const badWords = ["fuck", "shit", "bitch", "cunt", "nigger", "asshole", "dick", "pussy", "whore", "slut", "bastard", "faggot", "neggurt", "negurt", "flagot", "retigga", "swast", "jew", "nig", "neck", "67", "six", "nig", "igga", "Chink", "fuggot", "fugot", "nigget", "niggette", "semem", "semen", "cum", "cumm", "cumma", "swastika", "hitler", "nazi", "rape", "touch", "grape", "raping", "rap", "cracked", "cracker", "kill", "gay"];
        const containsProfanity = badWords.some(word => text.toLowerCase().includes(word));

        if (containsProfanity) {
            return new Response("Im not gonna fuckin say that", { status: 400 });
        }

        // 3. Call ElevenLabs API
        const voiceId = "ElVDyvTtykmY2kynfxR8"; // William Voice
        const apiKey = process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
            return new Response('Server Configuration Error: Missing API Key', { status: 500 });
        }

        const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: { stability: 0.5, similarity_boost: 0.5 }
            })
        });

        if (!elevenResponse.ok) {
            const errorText = await elevenResponse.text();
            return new Response(errorText, { status: elevenResponse.status });
        }

        // 4. Return Audio Stream
        return new Response(elevenResponse.body, {
            headers: { 'Content-Type': 'audio/mpeg' }
        });

    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
}
