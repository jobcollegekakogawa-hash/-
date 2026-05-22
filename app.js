const tipsByTrouble = {
  noise: [
    "静かな場所へ移動する",
    "イヤーマフ・耳せん・フードなどで音をやわらげる",
    "『あと5分で終わるよ』のように見通しを短く伝える",
  ],
  crowd: [
    "人が少ない時間帯や入口に近い席を選ぶ",
    "疲れたらすぐ離れられる『休憩場所』を先に決める",
    "短い滞在から始めて、少しずつ時間を伸ばす",
  ],
  transition: [
    "次の予定を先に伝える",
    "タイマーやカウントダウンで切り替えを見える化する",
    "『いま終わり・次これ』を短い言葉で繰り返す",
  ],
  panic: [
    "まず安全を確保し、刺激の少ない場所へ移動する",
    "短い言葉で伝える（例:『だいじょうぶ、ここで休もう』）",
    "落ち着いたあとに、何がつらかったか一緒に振り返る",
  ],
  mutism: [
    "話すことを急がせず、うなずき・指差し・カードで伝えられるようにする",
    "選択肢を与える（例:『AとBどちらがいい？』）",
    "安心できる人や場所から少しずつ練習する",
  ],
};

const troubleLabelByValue = {
  noise: "大きな音が苦手",
  crowd: "人が多い場所が苦手",
  transition: "切り替えが苦手",
  panic: "パニックになる",
  mutism: "場面緘黙",
};

const troubleSelect = document.querySelector("#troubleSelect");
const showBtn = document.querySelector("#showBtn");
const hint = document.querySelector("#hint");
const tipsList = document.querySelector("#tipsList");

function clearTips() {
  tipsList.innerHTML = "";
}

function showTips() {
  const selected = troubleSelect.value;

  clearTips();

  if (!selected || !tipsByTrouble[selected]) {
    hint.textContent = "困りごとを選ぶと、ここにおすすめが3つ表示されます。";
    return;
  }

  hint.textContent = `「${troubleLabelByValue[selected]}」へのおすすめです。`;

  tipsByTrouble[selected].forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    tipsList.appendChild(li);
  });
}

showBtn.addEventListener("click", showTips);
troubleSelect.addEventListener("change", showTips);
