let sharedAudioContext: AudioContext | null = null;
let nextPlaybackTime = 0;
const queuedPlaybackSources = new Set<AudioBufferSourceNode>();

export function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  targetSampleRate: number,
): Float32Array {
  if (targetSampleRate === inputSampleRate) {
    return buffer;
  }

  const ratio = inputSampleRate / targetSampleRate;
  const outputLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(outputLength);

  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;

    for (
      let index = offsetBuffer;
      index < nextOffsetBuffer && index < buffer.length;
      index += 1
    ) {
      accum += buffer[index] ?? 0;
      count += 1;
    }

    result[offsetResult] = accum / Math.max(count, 1);
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

export function float32To16BitPCM(buffer: Float32Array): Int16Array {
  const result = new Int16Array(buffer.length);

  for (let index = 0; index < buffer.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, buffer[index] ?? 0));
    result[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return result;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

const getAudioContext = async () => {
  if (sharedAudioContext) {
    if (sharedAudioContext.state === "suspended") {
      await sharedAudioContext.resume();
    }

    return sharedAudioContext;
  }

  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  sharedAudioContext = new AudioContextCtor({ sampleRate: 24000 });
  nextPlaybackTime = sharedAudioContext.currentTime;
  return sharedAudioContext;
};

export async function stopAudioPlayback(): Promise<void> {
  const audioContext = await getAudioContext();
  if (!audioContext) {
    return;
  }

  queuedPlaybackSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // noop
    }
  });

  queuedPlaybackSources.clear();
  nextPlaybackTime = audioContext.currentTime;
}

export async function playAudioChunk(base64: string): Promise<void> {
  const audioContext = await getAudioContext();
  if (!audioContext) {
    return;
  }

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  const pcm16 = new Int16Array(bytes.buffer);
  const floatData = new Float32Array(pcm16.length);

  for (let index = 0; index < pcm16.length; index += 1) {
    floatData[index] = pcm16[index] / 0x7fff;
  }

  const audioBuffer = audioContext.createBuffer(1, floatData.length, 24000);
  audioBuffer.copyToChannel(floatData, 0);

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.onended = () => {
    queuedPlaybackSources.delete(source);
  };

  const startTime = Math.max(audioContext.currentTime + 0.015, nextPlaybackTime);
  source.start(startTime);
  nextPlaybackTime = startTime + audioBuffer.duration;
  queuedPlaybackSources.add(source);
}
