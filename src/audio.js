// AUDIO
// Optional Web Audio analysis for visual-only music reactivity.

function setupAudio() {
  const { AUDIO } = window.OceanConfig;
  const audio = window.OceanState.audio;

  if (!AUDIO.enabled) {
    return;
  }

  audio.element = new Audio();
  audio.element.loop = true;
  audio.element.preload = "metadata";

  for (let i = 0; i < AUDIO.sources.length; i += 1) {
    const source = document.createElement("source");
    const src = AUDIO.sources[i];

    source.src = src;
    source.type = getAudioMimeType(src);
    audio.element.appendChild(source);
  }

  audio.element.addEventListener("error", () => {
    audio.isMissing = true;
    audio.isReady = false;
    audio.hasError = true;
  });
}

function startAudio() {
  const { AUDIO } = window.OceanConfig;
  const audio = window.OceanState.audio;

  if (!AUDIO.enabled || audio.hasStarted || audio.isMissing || !audio.element) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    audio.hasError = true;
    return;
  }

  audio.context = new AudioContextClass();
  audio.analyser = audio.context.createAnalyser();
  audio.analyser.fftSize = AUDIO.fftSize;
  audio.analyser.smoothingTimeConstant = AUDIO.smoothingTimeConstant;
  audio.frequencyData = new Uint8Array(audio.analyser.frequencyBinCount);
  audio.source = audio.context.createMediaElementSource(audio.element);
  audio.source.connect(audio.analyser);
  audio.analyser.connect(audio.context.destination);
  audio.hasStarted = true;

  audio.context.resume()
    .then(() => audio.element.play())
    .then(() => {
      audio.isReady = true;
    })
    .catch(() => {
      audio.hasError = true;
      audio.isReady = false;
    });
}

function updateAudio() {
  const audio = window.OceanState.audio;

  if (!audio.isReady || !audio.analyser || !audio.frequencyData) {
    easeAudioValuesToRest();
    return;
  }

  audio.analyser.getByteFrequencyData(audio.frequencyData);

  const bass = getBandAverage(1, 8);
  const treble = getBandAverage(45, 150);
  const volume = getBandAverage(1, 150);
  const bassRise = Math.max(0, bass - audio.bass);
  const trebleRise = Math.max(0, treble - audio.treble);
  const volumeRise = Math.max(0, volume - audio.volume);

  audio.bass += (bass - audio.bass) * 0.28;
  audio.treble += (treble - audio.treble) * 0.18;
  audio.volume += (volume - audio.volume) * 0.2;
  audio.bassHit = Math.max(audio.bassHit * 0.86, bassRise * 2.6);
  audio.trebleHit = Math.max(audio.trebleHit * 0.82, trebleRise * 2.2);
  audio.volumeHit = Math.max(audio.volumeHit * 0.84, volumeRise * 2.3);
}

function easeAudioValuesToRest() {
  const audio = window.OceanState.audio;

  audio.bass *= 0.92;
  audio.treble *= 0.92;
  audio.volume *= 0.92;
  audio.bassHit *= 0.86;
  audio.trebleHit *= 0.82;
  audio.volumeHit *= 0.84;
}

function getBandAverage(startBin, endBin) {
  const data = window.OceanState.audio.frequencyData;
  const start = Math.max(0, Math.min(data.length - 1, startBin));
  const end = Math.max(start, Math.min(data.length - 1, endBin));
  let total = 0;

  for (let i = start; i <= end; i += 1) {
    total += data[i];
  }

  return total / ((end - start + 1) * 255);
}

function getAudioMimeType(src) {
  if (src.endsWith(".ogg")) {
    return "audio/ogg";
  }

  if (src.endsWith(".wav")) {
    return "audio/wav";
  }

  return "";
}

window.OceanAudio = {
  setupAudio,
  startAudio,
  updateAudio,
};
