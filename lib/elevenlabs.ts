// Liam — natural, calm, clear — very smooth delivery
const ELEVENLABS_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ";

function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[-–—]{2,}/g, " — ")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function speakWithElevenLabs(text: string, apiKey: string): Promise<void> {
  const clean = cleanForSpeech(text);
  if (!clean) return;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: clean,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.80,
          style: 0.0,
          use_speaker_boost: false,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs error ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  await audio.play();
}
