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
  audio.element.preload = "auto";
  audio.element.playsInline = true;
  audio.sourceCandidates = getSupportedAudioSources(audio.element, AUDIO.sources);
  audio.sourceStatus = audio.sourceCandidates.length > 0
    ? `ready: ${getSourceQueueLabel()}`
    : "no playable source";
  selectAudioSource();

  audio.element.addEventListener("error", () => {
    audio.isReady = false;
    audio.hasError = true;
    audio.status = "source error";
    if (audio.hasStarted && tryNextAudioSource()) {
      audio.status = "starting";
      startCurrentAudioSource();
      return;
    }

    audio.sourceStatus = audio.currentSource
      ? `failed: ${getFileName(audio.currentSource)}`
      : "source failed";
    audio.isStarting = false;
  });

  audio.element.addEventListener("canplay", () => {
    if (!audio.isReady) {
      audio.status = "press key/click";
    }
  });
}

function startAudio() {
  const { AUDIO } = window.OceanConfig;
  const audio = window.OceanState.audio;

  if (!AUDIO.enabled || audio.isMissing || !audio.element) {
    return;
  }

  if (audio.isStarting || (audio.isReady && audio.status === "playing")) {
    return;
  }

  if (!selectAudioSource()) {
    audio.isMissing = true;
    audio.hasError = true;
    audio.status = "audio missing";
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    audio.hasError = true;
    audio.status = "no AudioContext";
    return;
  }

  if (!audio.hasStarted) {
    audio.context = new AudioContextClass();
    audio.analyser = audio.context.createAnalyser();
    audio.analyser.fftSize = AUDIO.fftSize;
    audio.analyser.smoothingTimeConstant = AUDIO.smoothingTimeConstant;
    audio.frequencyData = new Uint8Array(audio.analyser.frequencyBinCount);
    audio.source = audio.context.createMediaElementSource(audio.element);
    audio.source.connect(audio.analyser);
    audio.analyser.connect(audio.context.destination);
    audio.hasStarted = true;
  }

  audio.status = "starting";
  audio.sourceStatus = `trying: ${getFileName(audio.currentSource)}`;
  audio.hasError = false;
  audio.isStarting = true;

  startCurrentAudioSource();
}

function startCurrentAudioSource() {
  const { AUDIO } = window.OceanConfig;
  const audio = window.OceanState.audio;
  const attemptId = audio.startAttemptId + 1;

  audio.startAttemptId = attemptId;
  audio.sourceStatus = `trying: ${getFileName(audio.currentSource)}`;
  audio.context.resume()
    .then(() => {
      if (attemptId !== audio.startAttemptId) {
        return null;
      }

      audio.element.volume = 1;
      return waitForPlayStart(audio.element.play(), AUDIO.sourceStartTimeout, attemptId);
    })
    .then(() => {
      if (attemptId !== audio.startAttemptId) {
        return;
      }

      audio.isReady = true;
      audio.isStarting = false;
      audio.status = "playing";
      audio.sourceStatus = `playing: ${getFileName(audio.currentSource)}`;
    })
    .catch((error) => {
      if (attemptId !== audio.startAttemptId) {
        return;
      }

      if (shouldTryNextAudioSource(error) && tryNextAudioSource()) {
        audio.status = "starting";
        startCurrentAudioSource();
        return;
      }

      audio.hasError = true;
      audio.isStarting = false;
      audio.isReady = false;
      audio.status = error && error.name ? error.name : "play blocked";
      audio.sourceStatus = `blocked: ${getFileName(audio.currentSource)}`;
    });
}

function shouldTryNextAudioSource(error) {
  if (error && error.name === "NotAllowedError") {
    return false;
  }

  return true;
}

function waitForPlayStart(playPromise, timeoutMs, attemptId) {
  const audio = window.OceanState.audio;

  if (!playPromise || !playPromise.then) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      const error = new Error("source timeout");

      error.name = "source timeout";
      reject(error);
    }, timeoutMs);

    playPromise
      .then(() => {
        window.clearTimeout(timeout);

        if (attemptId !== audio.startAttemptId) {
          resolve();
          return;
        }

        resolve();
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
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

  if (audio.isReady && audio.status !== "playing") {
    audio.status = "playing";
  }
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
  if (src.endsWith(".mp3")) {
    return "audio/mpeg";
  }

  if (src.endsWith(".m4a")) {
    return "audio/mp4";
  }

  if (src.endsWith(".ogg")) {
    return "audio/ogg";
  }

  if (src.endsWith(".wav")) {
    return "audio/wav";
  }

  return "";
}

function getSupportedAudioSources(element, sources) {
  return sources
    .map((src) => ({
      src,
      type: getAudioMimeType(src),
    }))
    .filter((source) => {
      if (!source.type || !element.canPlayType) {
        return true;
      }

      return element.canPlayType(source.type) !== "";
    });
}

function selectAudioSource() {
  const audio = window.OceanState.audio;

  if (audio.currentSource) {
    return true;
  }

  if (!audio.sourceCandidates || audio.sourceCandidates.length === 0) {
    audio.sourceStatus = "no supported source";
    return false;
  }

  const candidate = audio.sourceCandidates[0];

  audio.sourceIndex = 0;
  audio.currentSource = candidate.src;
  audio.currentSourceType = candidate.type;
  audio.element.src = candidate.src;
  audio.element.load();
  audio.sourceStatus = `selected: ${getFileName(candidate.src)} (${audio.sourceCandidates.length} source${audio.sourceCandidates.length === 1 ? "" : "s"})`;
  return true;
}

function tryNextAudioSource() {
  const audio = window.OceanState.audio;
  const nextIndex = audio.sourceIndex + 1;

  if (!audio.sourceCandidates || nextIndex >= audio.sourceCandidates.length) {
    return false;
  }

  const candidate = audio.sourceCandidates[nextIndex];

  audio.sourceIndex = nextIndex;
  audio.currentSource = candidate.src;
  audio.currentSourceType = candidate.type;
  audio.sourceStatus = `trying: ${getFileName(candidate.src)}`;
  audio.element.src = candidate.src;
  audio.element.load();
  return true;
}

function getFileName(src) {
  if (!src) {
    return "none";
  }

  return src.split("/").pop();
}

function getSourceQueueLabel() {
  const audio = window.OceanState.audio;

  return audio.sourceCandidates
    .map((source) => getFileName(source.src))
    .join(" > ");
}

function drawAudioDebug() {
  const { AUDIO } = window.OceanConfig;
  const state = window.OceanState;
  const audio = state.audio;
  const ctx = state.ctx;

  if (!AUDIO.showDebugReadout) {
    return;
  }

  const { PERFORMANCE } = window.OceanConfig;
  const perf = state.performance;
  const left = 14;
  const top = 14;
  const width = 194;
  const rowHeight = 10;

  ctx.save();
  ctx.font = "11px Arial, Helvetica, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
  ctx.fillRect(left - 8, top - 8, width + 16, PERFORMANCE.showFrameRate ? 96 : 80);
  ctx.fillStyle = audio.isReady ? "rgba(170, 255, 220, 0.95)" : "rgba(255, 230, 120, 0.95)";
  ctx.fillText(`audio: ${audio.status}`, left, top);
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.fillText(`source: ${audio.sourceStatus}`, left, top + 14);
  drawAudioMeter(ctx, "bass", audio.bass, left, top + 32, width, rowHeight, "rgba(70, 255, 175, 0.88)");
  drawAudioMeter(ctx, "treble", audio.treble, left, top + 46, width, rowHeight, "rgba(120, 210, 255, 0.88)");
  drawAudioMeter(ctx, "volume", audio.volume, left, top + 60, width, rowHeight, "rgba(255, 245, 125, 0.88)");

  if (PERFORMANCE.showFrameRate) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.fillText(
      `fps: ${Math.round(perf.fps)} glow: ${perf.glowScale.toFixed(2)} ${perf.renderMode}`,
      left,
      top + 76,
    );
  }
  ctx.restore();
}

function drawAudioMeter(ctx, label, value, x, y, width, height, color) {
  const labelWidth = 42;
  const meterWidth = width - labelWidth;

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.fillText(label, x, y - 1);
  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
  ctx.fillRect(x + labelWidth, y, meterWidth, height);
  ctx.fillStyle = color;
  ctx.fillRect(x + labelWidth, y, meterWidth * Math.max(0, Math.min(1, value)), height);
}

window.OceanAudio = {
  setupAudio,
  startAudio,
  updateAudio,
  drawAudioDebug,
};
