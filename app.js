const defaultSlides = [
  {
    title: "契約書説明を開始します",
    body: "契約の目的、期間、金額、解除条件、守秘義務などを順番に確認します。",
  },
  {
    title: "契約期間を確認しましょう",
    body: "開始日、終了日、自動更新の有無、終了時の手続きが記載されているか確認してください。",
  },
  {
    title: "費用と支払条件を確認しましょう",
    body: "月額・初期費用・追加費用・支払期日・遅延時の扱いを重点的に確認します。",
  },
  {
    title: "義務と禁止事項を確認しましょう",
    body: "秘密保持、個人情報、成果物の扱い、第三者への開示制限などを理解しましょう。",
  },
  {
    title: "説明完了後は直筆署名へ",
    body: "疑問点がなければ、紙の契約書を確認し、ご本人が署名欄へ直筆で署名してください。",
  },
];

let slides = [...defaultSlides];
let currentSlide = 0;
let timerId = null;
let voiceEnabled = false;

const contractFile = document.querySelector("#contractFile");
const contractText = document.querySelector("#contractText");
const generateBtn = document.querySelector("#generateBtn");
const slideLabel = document.querySelector("#slideLabel");
const slideTitle = document.querySelector("#slideTitle");
const slideBody = document.querySelector("#slideBody");
const prevBtn = document.querySelector("#prevBtn");
const playBtn = document.querySelector("#playBtn");
const nextBtn = document.querySelector("#nextBtn");
const voiceBtn = document.querySelector("#voiceBtn");
const voiceStatus = document.querySelector("#voiceStatus");
const exportBtn = document.querySelector("#exportBtn");
const exportStatus = document.querySelector("#exportStatus");
const downloadLink = document.querySelector("#downloadLink");
const videoCanvas = document.querySelector("#videoCanvas");
const canvasContext = videoCanvas.getContext("2d");

const videoWidth = videoCanvas.width;
const videoHeight = videoCanvas.height;
const slideDurationMs = 4200;
const exportFrameIntervalMs = 100;

function extractFirstMatch(text, pattern, fallback) {
  const match = text.match(pattern);
  return match ? match[0] : fallback;
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function buildSlidesFromContract(rawText) {
  const text = rawText.replace(/\s+/g, " ").trim();

  if (!text) {
    return [...defaultSlides];
  }

  const period = extractFirstMatch(
    text,
    /(?:20\d{2}年\d{1,2}月\d{1,2}日|\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d+年間|\d+か月|\d+ヶ月)/,
    "契約期間の記載"
  );
  const price = extractFirstMatch(text, /(?:\d{1,3}(?:,\d{3})+|\d+)\s*円/, "金額の記載");
  const notice = extractFirstMatch(text, /\d+日前/, "事前通知の期限");

  const confidentiality = hasAny(text, ["秘密", "個人情報", "第三者", "開示"])
    ? "秘密保持・個人情報・第三者開示に関する条項が含まれています。"
    : "秘密保持や個人情報の扱いに関する条項があるか確認してください。";

  const cancellation = hasAny(text, ["解約", "解除", "終了"])
    ? `解約・解除条項があります。特に「${notice}」などの通知期限を確認しましょう。`
    : "解約・解除・終了条件が明確に書かれているか確認しましょう。";

  return [
    {
      title: "契約書の全体像",
      body: `読み込んだ契約書は約${text.length.toLocaleString()}文字です。重要な条件を順番に確認します。`,
    },
    {
      title: "期間・更新条件",
      body: `期間に関する手がかりとして「${period}」が見つかりました。開始日、終了日、自動更新の有無を確認してください。`,
    },
    {
      title: "金額・支払条件",
      body: `費用に関する手がかりとして「${price}」が見つかりました。支払期日、追加費用、遅延時の扱いも確認しましょう。`,
    },
    {
      title: "守るべき義務",
      body: confidentiality,
    },
    {
      title: "解約・解除の注意点",
      body: cancellation,
    },
    {
      title: "直筆署名へ進む前に",
      body: "説明内容に不明点がなければ、最終版の紙の契約書を確認し、ご本人が直筆で署名してください。",
    },
  ];
}


function buildNarration(slide) {
  return `重要ポイントです。${slide.title}。${slide.body}`;
}

function speakCurrentSlide() {
  if (!voiceEnabled || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(buildNarration(slides[currentSlide]));
  utterance.lang = "ja-JP";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function setVoiceStatus(text) {
  if (voiceStatus) {
    voiceStatus.textContent = text;
  }
}

function drawIllustration(index) {
  const x = 930;
  const y = 190;
  canvasContext.save();
  canvasContext.translate(x, y);
  canvasContext.fillStyle = "rgba(242, 192, 120, 0.9)";
  canvasContext.strokeStyle = "#fff";
  canvasContext.lineWidth = 5;

  if (index % 3 === 0) {
    drawRoundedRect(canvasContext, 0, 0, 230, 150, 18);
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillStyle = "#173f43";
    canvasContext.fillRect(20, 35, 190, 16);
    canvasContext.fillRect(20, 66, 160, 16);
  } else if (index % 3 === 1) {
    canvasContext.beginPath();
    canvasContext.arc(90, 70, 58, 0, Math.PI * 2);
    canvasContext.fill();
    canvasContext.beginPath();
    canvasContext.arc(170, 95, 46, 0, Math.PI * 2);
    canvasContext.fill();
    canvasContext.beginPath();
    canvasContext.moveTo(22, 148);
    canvasContext.lineTo(228, 148);
    canvasContext.stroke();
  } else {
    canvasContext.beginPath();
    canvasContext.moveTo(18, 130);
    canvasContext.lineTo(86, 42);
    canvasContext.lineTo(148, 86);
    canvasContext.lineTo(212, 22);
    canvasContext.lineTo(212, 130);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
  }

  canvasContext.restore();
}

function renderSlide() {
  const slide = slides[currentSlide];
  slideLabel.textContent = `Slide ${currentSlide + 1} / ${slides.length}`;
  slideTitle.textContent = slide.title;
  slideBody.textContent = slide.body;
  speakCurrentSlide();
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  renderSlide();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  renderSlide();
}

function stopPlayback() {
  window.clearInterval(timerId);
  timerId = null;
  playBtn.textContent = "再生";
  if (window.speechSynthesis) { window.speechSynthesis.cancel(); }
}

function togglePlayback() {
  if (timerId) {
    stopPlayback();
    return;
  }

  playBtn.textContent = "停止";
  timerId = window.setInterval(nextSlide, slideDurationMs);
  nextSlide();
}

function splitTextIntoLines(context, text, maxWidth) {
  const characters = [...text];
  const lines = [];
  let line = "";

  characters.forEach((character) => {
    const nextLine = line + character;

    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = character;
      return;
    }

    line = nextLine;
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawVideoSlide(slide, index, progress) {
  const gradient = canvasContext.createLinearGradient(0, 0, videoWidth, videoHeight);
  gradient.addColorStop(0, "#173f43");
  gradient.addColorStop(0.62, "#111b22");
  gradient.addColorStop(1, "#0b1218");
  canvasContext.fillStyle = gradient;
  canvasContext.fillRect(0, 0, videoWidth, videoHeight);

  canvasContext.fillStyle = "rgba(242, 192, 120, 0.22)";
  canvasContext.beginPath();
  canvasContext.arc(190, 140, 190, 0, Math.PI * 2);
  canvasContext.fill();

  canvasContext.fillStyle = "rgba(255, 255, 255, 0.08)";
  drawRoundedRect(canvasContext, 76, 62, videoWidth - 152, videoHeight - 124, 42);
  canvasContext.fill();

  canvasContext.fillStyle = "#f2c078";
  canvasContext.font = "700 30px system-ui, sans-serif";
  canvasContext.fillText(`CONTRACT GUIDE  |  SLIDE ${index + 1} / ${slides.length}`, 116, 132);

  canvasContext.fillStyle = "#ffffff";
  canvasContext.font = "800 64px system-ui, sans-serif";
  const titleLines = splitTextIntoLines(canvasContext, slide.title, 960).slice(0, 2);
  titleLines.forEach((line, lineIndex) => {
    canvasContext.fillText(line, 116, 240 + lineIndex * 78);
  });

  canvasContext.fillStyle = "rgba(255, 255, 255, 0.82)";
  canvasContext.font = "400 34px system-ui, sans-serif";
  const bodyLines = splitTextIntoLines(canvasContext, slide.body, 990).slice(0, 5);
  bodyLines.forEach((line, lineIndex) => {
    canvasContext.fillText(line, 116, 420 + lineIndex * 52);
  });

  drawIllustration(index);

  canvasContext.fillStyle = "rgba(255, 255, 255, 0.18)";
  drawRoundedRect(canvasContext, 116, 624, 1048, 18, 9);
  canvasContext.fill();

  canvasContext.fillStyle = "#f2c078";
  drawRoundedRect(canvasContext, 116, 624, 1048 * progress, 18, 9);
  canvasContext.fill();
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function createRecorder(stream, chunks) {
  const preferredTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  return recorder;
}

async function exportVideoData() {
  if (!window.MediaRecorder || !videoCanvas.captureStream) {
    exportStatus.textContent = "このブラウザは動画データ生成に対応していません。ChromeやEdgeでお試しください。";
    return;
  }

  stopPlayback();
  slides = buildSlidesFromContract(contractText.value);
  currentSlide = 0;
  renderSlide();
  exportBtn.disabled = true;
  exportBtn.textContent = "生成中...";
  downloadLink.hidden = true;
  exportStatus.textContent = "動画データを生成中です。イラスト入りで書き出します（音声ガイドはブラウザ再生時に利用できます）...";

  const chunks = [];
  let stream;

  try {
    stream = videoCanvas.captureStream(30);
    const recorder = createRecorder(stream, chunks);
    const recordingFinished = new Promise((resolve) => {
      recorder.addEventListener("stop", resolve, { once: true });
    });

    recorder.start();

    for (let slideIndex = 0; slideIndex < slides.length; slideIndex += 1) {
      const slide = slides[slideIndex];
      const steps = Math.ceil(slideDurationMs / exportFrameIntervalMs);

      for (let step = 0; step <= steps; step += 1) {
        const progress = Math.min(step / steps, 1);
        drawVideoSlide(slide, slideIndex, progress);
        await wait(exportFrameIntervalMs);
      }
    }

    recorder.stop();
    await recordingFinished;

    const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
    const url = URL.createObjectURL(blob);

    if (downloadLink.href.startsWith("blob:")) {
      URL.revokeObjectURL(downloadLink.href);
    }

    downloadLink.href = url;
    downloadLink.hidden = false;
    exportStatus.textContent = `動画データを作成しました（${(blob.size / 1024 / 1024).toFixed(2)}MB）。自動で開始しない場合は下のリンクからダウンロードしてください。`;
    downloadLink.click();
  } catch (error) {
    exportStatus.textContent = `動画データの生成に失敗しました: ${error.message}`;
  } finally {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    exportBtn.disabled = false;
    exportBtn.textContent = "動画データを作成";
  }
}

contractFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  contractText.value = await file.text();
});

generateBtn.addEventListener("click", () => {
  stopPlayback();
  slides = buildSlidesFromContract(contractText.value);
  currentSlide = 0;
  renderSlide();
});

prevBtn.addEventListener("click", () => {
  stopPlayback();
  prevSlide();
});

nextBtn.addEventListener("click", () => {
  stopPlayback();
  nextSlide();
});

playBtn.addEventListener("click", togglePlayback);
voiceBtn.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? "音声OFF" : "音声ON";
  setVoiceStatus(voiceEnabled ? "音声ガイド: ON（重要ポイントを読み上げ中）" : "音声ガイド: OFF");
  if (voiceEnabled) {
    speakCurrentSlide();
  } else if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
});
exportBtn.addEventListener("click", exportVideoData);

renderSlide();
