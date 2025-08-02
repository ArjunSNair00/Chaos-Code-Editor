const textarea = document.getElementById('rageBox');
const bpmToggle = document.getElementById('bpmToggle');
const bpmInput = document.getElementById('bpmInput');
const soundPreset = document.getElementById('sounds');
const gainSlider = document.getElementById('gainslider');
const cutToggle = document.getElementById('cutToggle');
const runningLights = document.getElementById('runningLights').children;
const controls = document.querySelector('.controls');
const htmlElement = document.documentElement;
const tips = [
"🦾ThankanChetan's Tip: War is not won by weapons, it is won by keyboard warriors!",
"🫀ThankanChetan's Tip: With enough effort, you can destroy any keyboard!",
"🤖ThankanChetan's Tip: If you can't code, use chatgpt, if you can't use chatgpt, learn the language, but whatever you do, you need to keep coding.",
"🐄ThankanChetan's Tip: never trust a cow because the sun can't swim",
"🖥️ThankanChetan's Tip: Don't count the i, make the i count",
"🔥ThankanChetan's Tip: I'm not in danger, compiler, i am the danger",
"🔥ThankanChetan's Tip: I'm the one who codes.",
"💡ThankanChetan's Tip: If you're brave enough to say goodbye, life will reward you with a new hello world"
];
function showTip() {
  const tipText = tips[Math.floor(Math.random() * tips.length)];
  const tipBox = document.querySelector("#tipOverlay .tip-box");
  tipBox.innerHTML = tipText;
  document.getElementById("tipOverlay").style.display = "flex";
}



let currentSource = null;
let pitchShift = 0;
let samples = [];
let themeSource = null;
let isPlaying = false;
let currentLight = 0;
let colorInterval;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain();
gainNode.gain.value = parseFloat(gainSlider.value);
gainNode.connect(audioCtx.destination);

gainSlider.addEventListener('input', () => {
  gainNode.gain.value = parseFloat(gainSlider.value);
});

async function loadSamples(preset) {
  samples = [];
  let filenames = [];

  if (preset === "piano") {
    for (let i = 1; i <= 53; i++) filenames.push(`sounds/piano/piano (${i}).wav`);
  } else if (preset === "memes") {
    for (let i = 1; i <= 24; i++) filenames.push(`sounds/memes/goofy_ahh_sounds - Song jump_${i}.wav`);
    cutToggle.checked = true;
  } else if (preset === "drums") {
    for (let i = 1; i <= 11; i++) filenames.push(`sounds/drums/drums (${i}).wav`);
    cutToggle.checked = true;
  } else if (preset === "guitar") {
    for (let i = 1; i <= 31; i++) filenames.push(`sounds/guitar/guitar (${i}).wav`);
  }

  for (const file of filenames) {
    try {
      const res = await fetch(file);
      const buf = await res.arrayBuffer();
      const audio = await audioCtx.decodeAudioData(buf);
      samples.push(audio);
    } catch (err) {
      console.error(`Error loading file: ${file}`, err);
    }
  }
}

function play() {
  if (samples.length === 0) return;

  if (cutToggle.checked && currentSource) {
    currentSource.stop();
  }

  const index = Math.floor(Math.random() * samples.length);
  const source = audioCtx.createBufferSource();
  source.buffer = samples[index];
  source.playbackRate.value = Math.pow(2, pitchShift / 12);
  source.connect(gainNode);
  source.start(0);

  currentSource = source;
}

function adjustPitch(change) {
  pitchShift += change;
}

function getCursorPosition(element) {
  const { selectionStart } = element;
  const { fontSize, lineHeight, paddingTop, paddingLeft } = getComputedStyle(element);
  const text = element.value.substring(0, selectionStart);
  const lines = text.split('\n');
  const lastLine = lines[lines.length - 1];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize} monospace`;
  const textWidth = ctx.measureText(lastLine).width;
  const lineCount = lines.length;
  const x = parseFloat(paddingLeft) + textWidth;
  const y = parseFloat(paddingTop) + lineCount * parseFloat(lineHeight);
  const rect = element.getBoundingClientRect();
  return { x: rect.left + x, y: rect.top + y };
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

function triggerPumpEffect() {
  const color = getRandomColor();
  htmlElement.style.setProperty('--pump-color', color);
  htmlElement.classList.add('pump');
  textarea.classList.add('pump');
  controls.classList.add('pump');
  setTimeout(() => {
    htmlElement.classList.remove('pump');
    textarea.classList.remove('pump');
    controls.classList.remove('pump');
  }, 300);
}

function startBorderPumpCycle() {
  clearInterval(colorInterval);
  const bpm = parseInt(bpmInput.value);
  const interval = 60000 / bpm;
  triggerPumpEffect(); 
  colorInterval = setInterval(triggerPumpEffect, interval);
}

textarea.addEventListener('input', async (e) => {
  await resumeContext();
  play();
  if (!bpmToggle.checked) {
    triggerShakeGlitch();
    triggerLights();
  }

  const { x, y } = getCursorPosition(textarea);
  for (let i = 0; i < 3; i++) {
    const particle = document.createElement('div');
    particle.className = 'fire-particle';
    particle.style.left = `${x + Math.random() * 5 - 2.5}px`;
    particle.style.top = `${y + Math.random() * 5 - 2.5}px`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 500);
  }
});

function triggerShakeGlitch() {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 300);

  const glitchElem = document.createElement('div');
  glitchElem.className = 'glitch';
  document.body.appendChild(glitchElem);
  setTimeout(() => glitchElem.remove(), 300);
}

function triggerLights() {
  runningLights[currentLight].classList.remove('active');
  currentLight = (currentLight + 1) % runningLights.length;
  runningLights[currentLight].classList.add('active');
  setTimeout(() => runningLights[currentLight].classList.remove('active'), 300);

  if (bpmToggle.checked) {
    textarea.classList.add('running');
    controls.classList.add('running');
    setTimeout(() => {
      textarea.classList.remove('running');
      controls.classList.remove('running');
    }, 300);
  }
}

let bpmInterval;
function startBPM() {
  clearInterval(bpmInterval);
  const bpm = parseInt(bpmInput.value);
  const interval = 60000 / bpm;
  bpmInterval = setInterval(() => {
    if (bpmToggle.checked) {
      triggerShakeGlitch();
      triggerLights();
    }
  }, interval);
}

bpmToggle.addEventListener('change', () => {
  if (bpmToggle.checked) startBPM();
  else clearInterval(bpmInterval);
});

bpmInput.addEventListener('input', () => {
  if (bpmToggle.checked) startBPM();
  startBorderPumpCycle();
});

soundPreset.addEventListener('change', () => {
  const selected = soundPreset.value;
  if (selected) loadSamples(selected);
});

async function playTheme() {
    if (isPlaying) return;
    await resumeContext();
    bpmToggle.checked = true;
    startBPM();
    isPlaying = true;
    clearTimeout(inactivityTimer);

    try {
        const res = await fetch('sounds/music/wtfisthis.wav');
        const buf = await res.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(buf);
        themeSource = audioCtx.createBufferSource();
        themeSource.buffer = audioBuffer;
        themeSource.connect(gainNode);
        themeSource.start();
    } catch (err) {
        console.error("Error playing theme file:", err);
        isPlaying = false;
    }
}

function pauseTheme() {
    if (themeSource && isPlaying) {
        themeSource.stop();
        isPlaying = false;
        clearInterval(bpmInterval);
        resetInactivityTimer();
    }
}

function restartTheme() {
    if (themeSource) {
        themeSource.stop();
    }
    isPlaying = false;
    clearTimeout(inactivityTimer); 
    playTheme();
}

async function resumeContext() {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  soundPreset.value = "piano";
  loadSamples("piano");
  startBorderPumpCycle();
  setTimeout(() => {
    document.querySelector('.explosion-left').style.animation = 'explode 1s ease-out';
    document.querySelector('.explosion-right').style.animation = 'explode 1s ease-out';
  }, 500);
});

let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    document.getElementById("tipOverlay").style.display = "none";
    
    if (!isPlaying) {
        inactivityTimer = setTimeout(() => {
            showTip();
        }, 7000);
    }
}

['mousemove', 'keydown', 'input', 'click'].forEach(evt => {
  window.addEventListener(evt, resetInactivityTimer);
});
resetInactivityTimer();

    document.getElementById("tipOverlay").addEventListener("click", () => {
  document.getElementById("tipOverlay").style.display = "none";
  resetInactivityTimer();
});