const pressedKeys = new Set();
const activeSources = new Map(); // 키에 대응하는 재생 노드 저장
const context = new (window.AudioContext || window.webkitAudioContext)();

let sharedBuffer = null;

const playbackRates = {
  q: 0.5946, // A
  w: 0.6674, // B
  e: 0.7491, // C
  r: 0.8409, // D
  t: 0.9441, // E
  y: 1.0, // F (기준음)
  u: 1.1225, // G
  i: 1.2599, // A
  o: 1.4142, // B
  p: 1.4983, // C (다음 옥타브)
  "[": 1.6818, // D
  "]": 1.8877, // E
  "\\": 2.0, // F
  "₩": 2.0,
  "|": 2.0,
  2: 0.63, // A♯
  4: 0.7936, // C♯
  5: 0.8909, // D♯
  7: 1.0595, // F♯
  8: 1.1892, // G♯
  9: 1.3348, // A♯ (다음 옥타브)
  "-": 1.5874, // C♯ (다음 옥타브)
  "=": 1.7818, // D♯ (다음 옥타브)
};

document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (!pressedKeys.has(key) && isPlayableKey(key)) {
    pressedKeys.add(key);
    playSound(key);
    animateOtamatone(true); // 입을 연다
  }
  setKeyVisual(key, true);
});

document.addEventListener("keyup", (e) => {
  const key = e.key;
  pressedKeys.delete(key);

  if (activeSources.has(key)) {
    const source = activeSources.get(key);
    source.stop();
    activeSources.delete(key);
  }

  if (pressedKeys.size === 0) {
    animateOtamatone(false); // 모든 키가 떼졌을 때 입을 닫는다
  }

  setKeyVisual(key, false);
});

function setKeyVisual(key, active) {
  const normalizedKey = key === "\\" ? "\\\\" : key; // 역슬래시 키 처리
  const el = document.querySelector(
    `.keyboard-visualizer span[data-key="${normalizedKey}"]`
  );
  if (el) {
    if (active) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  }
}

function isPlayableKey(key) {
  return Object.keys(playbackRates).includes(key);
}

function loadBuffer() {
  return fetch("sounds/base_note.mp3")
    .then((res) => res.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      sharedBuffer = buffer;
    });
}

function playSound(key) {
  if (!sharedBuffer) return;

  const source = context.createBufferSource();
  source.buffer = sharedBuffer;
  source.playbackRate.value = playbackRates[key];
  source.connect(context.destination);
  source.start();
  activeSources.set(key, source);
}

function animateOtamatone(open) {
  const otamatone = document.getElementById("otamatone");
  if (open) {
    otamatone.src = "images/otamatone_open.png"; // 입 연 이미지
  } else {
    otamatone.src = "images/otamatone_closed.png"; // 입 닫은 이미지
  }
}

// 첫 로딩 시 오디오 버퍼 미리 로드
loadBuffer();
