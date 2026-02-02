import { GoogleGenAI } from "@google/genai";
import wavefile from "wavefile";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set in environment variables");
}

export interface TtsOptions {
  languageCode: string;
  voiceName?: string;
}

const voiceByLanguage: Record<string, string> = {
  "en": "Kore",
  "en-US": "Kore",
  "es": "Puck",
  "es-ES": "Puck",
  "hi": "Aoede",
  "hi-IN": "Aoede",
};

export const synthesizeSpeech = async (
  text: string,
  options: TtsOptions
): Promise<Buffer> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!text || text.trim().length === 0) {
    throw new Error("Text is required for TTS");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const voiceName = options.voiceName || voiceByLanguage[options.languageCode] || "Kore";

  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{
      role: "user",
      parts: [{ text }],
    }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
  });

  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inlineData?.data) {
    throw new Error("No audio data returned from Gemini TTS");
  }

  const mimeType = inlineData.mimeType || "audio/pcm";
  console.log("[tts] mimeType:", mimeType);
  const data = inlineData.data as unknown;
  const audioBytes = typeof data === "string" ? Buffer.from(data, "base64") : Buffer.from(data as Uint8Array);
  console.log("[tts] bytes:", audioBytes.length);

  if (mimeType.includes("pcm")) {
    const rateMatch = mimeType.match(/rate=([0-9]+)/);
    const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
    const encodingMatch = mimeType.match(/encoding=([^;]+)/i);
    const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : "";
    const isFloat = encoding.includes("f32") || encoding.includes("float");
    const isL16 = /audio\/L16/i.test(mimeType);

    if (!isFloat) {
      const pcm = Buffer.from(audioBytes);
      const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.length);
      const length = Math.floor(pcm.length / 2);
      const decode = (littleEndian: boolean) => {
        const out = new Int16Array(length);
        for (let i = 0; i < length; i++) {
          out[i] = view.getInt16(i * 2, littleEndian);
        }
        return out;
      };

      const le = decode(true);
      const be = decode(false);

      const speechRatio = (samples: Int16Array) => {
        let sumSq = 0;
        let sumSqSmooth = 0;
        const window = 16;
        let acc = 0;
        for (let i = 0; i < samples.length; i++) {
          const v = samples[i];
          sumSq += v * v;
          acc += v;
          if (i >= window) {
            acc -= samples[i - window];
          }
          const avg = acc / Math.min(i + 1, window);
          sumSqSmooth += avg * avg;
        }
        return sumSqSmooth / Math.max(sumSq, 1);
      };

      const leRatio = speechRatio(le);
      const beRatio = speechRatio(be);
      const chosen = (isL16 ? beRatio >= leRatio : leRatio >= beRatio) ? (isL16 ? be : le) : (isL16 ? le : be);
      console.log("[tts] ratio le/be:", leRatio.toFixed(4), beRatio.toFixed(4), "chosen", chosen === le ? "le" : "be");

      // Convert chosen samples to little-endian PCM bytes
      for (let i = 0; i < length; i++) {
        const val = chosen[i];
        pcm[i * 2] = val & 0xff;
        pcm[i * 2 + 1] = (val >> 8) & 0xff;
      }
      const header = Buffer.alloc(44);
      const dataSize = pcm.length;
      header.write("RIFF", 0);
      header.writeUInt32LE(36 + dataSize, 4);
      header.write("WAVE", 8);
      header.write("fmt ", 12);
      header.writeUInt32LE(16, 16); // PCM header size
      header.writeUInt16LE(1, 20); // PCM format
      header.writeUInt16LE(1, 22); // mono
      header.writeUInt32LE(sampleRate || 24000, 24);
      header.writeUInt32LE((sampleRate || 24000) * 2, 28); // byte rate
      header.writeUInt16LE(2, 32); // block align
      header.writeUInt16LE(16, 34); // bits per sample
      header.write("data", 36);
      header.writeUInt32LE(dataSize, 40);
      return Buffer.concat([header, pcm]);
    }

    const wav = new wavefile.WaveFile();
    const samples = new Float32Array(
      audioBytes.buffer,
      audioBytes.byteOffset,
      Math.floor(audioBytes.length / 4)
    );
    wav.fromScratch(1, sampleRate || 24000, "32f", samples as any);
    return Buffer.from(wav.toBuffer());
  }

  return audioBytes;
};
