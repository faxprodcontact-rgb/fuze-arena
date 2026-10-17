// =====================================================================
//  SONS — bruitages et musique 8-bit fabriqués à la volée (aucun fichier)
// =====================================================================
const PREF = 'fuze-sound';
let ac = null, master = null, sfxOut = null, musicOut = null, noiseBuf = null;
let quiet = false;
const prefs = { sfx: true, music: true };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF) || '{}')); } catch (e) { /* stockage indisponible */ }

export const getPref = (k) => prefs[k];
export function setPref(k, v) {
  prefs[k] = v;
  try { localStorage.setItem(PREF, JSON.stringify(prefs)); } catch (e) { /* stockage indisponible */ }
  if (k === 'music' && !v) stopMusic();
}

/** Le son ne peut démarrer qu'après un premier toucher de l'écran (règle des téléphones) */
export function unlock() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.7; master.connect(ac.destination);
    sfxOut = ac.createGain(); sfxOut.connect(master);
    musicOut = ac.createGain(); musicOut.gain.value = 0.22; musicOut.connect(master);
  }
  if (ac.state === 'suspended') ac.resume();
}

/** Coupe les bruitages pendant l'avance rapide d'un combat */
export function setQuiet(v) { quiet = v; }

const can = () => ac && prefs.sfx && !quiet;

function tone(freq, { type = 'square', dur = 0.12, vol = 0.15, slide = 0, delay = 0, at = null, out = sfxOut } = {}) {
  if (!ac) return;
  const t = at ?? ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + dur + 0.03);
}

function noise({ dur = 0.15, vol = 0.2, freq = 1200, q = 1, type = 'bandpass', delay = 0, slide = 0 } = {}) {
  if (!ac) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + delay;
  const s = ac.createBufferSource();
  s.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (slide) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(sfxOut);
  s.start(t); s.stop(t + dur + 0.03);
}

const arp = (notes, { type = 'square', step = 0.07, dur = 0.12, vol = 0.08 } = {}) =>
  notes.forEach((f, i) => tone(f, { type, dur, vol, delay: i * step }));

export const SFX = {
  click: () => can() && tone(660, { dur: 0.05, vol: 0.05 }),
  swing: () => can() && noise({ dur: 0.14, vol: 0.18, freq: 2600, slide: 0.3, q: 0.8 }),
  hit: () => { if (!can()) return; noise({ dur: 0.12, vol: 0.35, freq: 900, q: 0.7 }); tone(150, { dur: 0.1, vol: 0.12, slide: 0.5 }); },
  crit: () => { if (!can()) return; noise({ dur: 0.18, vol: 0.45, freq: 700, q: 0.6 }); tone(180, { type: 'sawtooth', dur: 0.16, vol: 0.15, slide: 0.4 }); tone(1320, { dur: 0.12, vol: 0.06, delay: 0.04 }); },
  dodge: () => can() && noise({ dur: 0.22, vol: 0.12, freq: 3200, slide: 0.45 }),
  arrow: () => { if (!can()) return; noise({ dur: 0.12, vol: 0.12, freq: 5000, slide: 0.4, type: 'highpass' }); tone(900, { type: 'triangle', dur: 0.08, vol: 0.05, slide: 1.6 }); },
  fire: () => can() && noise({ dur: 0.45, vol: 0.28, freq: 700, slide: 0.35, type: 'lowpass' }),
  magic: () => { if (!can()) return; tone(500, { type: 'sine', dur: 0.25, vol: 0.12, slide: 2 }); tone(750, { type: 'sine', dur: 0.25, vol: 0.08, slide: 2, delay: 0.05 }); },
  bolt: () => { if (!can()) return; noise({ dur: 0.35, vol: 0.4, freq: 4000, slide: 0.15, type: 'highpass' }); tone(60, { type: 'sawtooth', dur: 0.3, vol: 0.15, slide: 0.5 }); },
  boom: () => { if (!can()) return; noise({ dur: 0.6, vol: 0.45, freq: 320, slide: 0.3, type: 'lowpass' }); tone(80, { type: 'sine', dur: 0.5, vol: 0.3, slide: 0.4 }); },
  heal: () => can() && arp([523, 659, 784, 1047], { type: 'sine', step: 0.06, dur: 0.18, vol: 0.09 }),
  shield: () => { if (!can()) return; tone(300, { type: 'triangle', dur: 0.3, vol: 0.12, slide: 2.5 }); tone(600, { type: 'sine', dur: 0.25, vol: 0.06, delay: 0.05 }); },
  roar: () => { if (!can()) return; tone(110, { type: 'sawtooth', dur: 0.45, vol: 0.15, slide: 0.6 }); noise({ dur: 0.45, vol: 0.15, freq: 400, type: 'lowpass' }); },
  buff: () => can() && arp([392, 523, 659], { step: 0.07, dur: 0.1, vol: 0.06 }),
  stun: () => can() && arp([1200, 900, 1200, 900], { type: 'sine', step: 0.07, dur: 0.07, vol: 0.05 }),
  dot: () => can() && noise({ dur: 0.15, vol: 0.1, freq: 700, type: 'lowpass' }),
  rage: () => can() && arp([220, 277, 220, 277], { type: 'sawtooth', step: 0.16, dur: 0.15, vol: 0.1 }),
  win: () => can() && arp([523, 659, 784, 1047, 784, 1047, 1319], { step: 0.11, dur: 0.18, vol: 0.1 }),
  lose: () => can() && arp([392, 349, 311, 262], { type: 'triangle', step: 0.22, dur: 0.3, vol: 0.12 }),
  chest: () => { if (!can()) return; noise({ dur: 0.7, vol: 0.12, freq: 300, type: 'lowpass' }); arp([196, 220, 247, 262], { type: 'triangle', step: 0.18, dur: 0.16, vol: 0.1 }); },
  loot: (rarity = 0) => {
    if (!can()) return;
    const notes = [[784, 988], [784, 988, 1175], [659, 784, 988, 1319], [523, 659, 784, 1047, 1319], [523, 659, 784, 1047, 1319, 1568, 2093]][rarity] || [784];
    arp(notes, { step: 0.07, dur: 0.16, vol: 0.09 });
    if (rarity >= 3) noise({ dur: 0.6, vol: 0.08, freq: 6000, type: 'highpass', delay: 0.2 });
  },
  level: () => can() && arp([523, 523, 523, 698, 880, 1047], { step: 0.09, dur: 0.14, vol: 0.09 }),
  fuse: () => { if (!can()) return; tone(200, { type: 'sawtooth', dur: 0.5, vol: 0.1, slide: 4 }); arp([1047, 1319, 1568], { type: 'sine', step: 0.06, dur: 0.2, vol: 0.08 }); },
  message: () => can() && arp([880, 1175], { type: 'sine', step: 0.08, dur: 0.12, vol: 0.06 }),
};

// ------------------------------ Musique de combat ------------------------------
const N = (m) => 440 * Math.pow(2, (m - 69) / 12);   // numéro de note MIDI -> fréquence
// La mineur : Am - F - C - G, 8 croches par accord
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const LEAD = [76, 74, 72, 74, 76, 76, 76, null, 74, 74, 74, null, 76, 79, 79, null, 76, 74, 72, 74, 76, 76, 76, 76, 74, 74, 76, 74, 72, null, null, null];
let musicTimer = null;

export function startMusic() {
  if (!ac || !prefs.music || musicTimer) return;
  const spb = 60 / 150 / 2;            // une croche à 150 bpm
  let next = ac.currentTime + 0.05, step = 0;
  musicTimer = setInterval(() => {
    while (next < ac.currentTime + 0.25) {
      const chord = CHORDS[Math.floor(step / 8) % 4];
      if (step % 2 === 0) tone(N(chord[0] - 12), { type: 'triangle', dur: spb * 1.8, vol: 0.35, at: next, out: musicOut });
      tone(N(chord[step % 3] + 12), { type: 'square', dur: spb * 0.6, vol: 0.06, at: next, out: musicOut });
      const lead = LEAD[step % 32];
      if (lead) tone(N(lead), { type: 'square', dur: spb * 0.9, vol: 0.1, at: next, out: musicOut });
      next += spb;
      step = (step + 1) % 32;
    }
  }, 60);
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}
