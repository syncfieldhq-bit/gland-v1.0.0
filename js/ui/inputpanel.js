/* ========================================================
 * G-LAND v1.0.0 - Input Panel (Legacy Layout)
 * 5 パステルボタン + パット 6 個 + 確定 1 個
 * ======================================================== */

const InputPanel = {
  /**
   * @param {HTMLElement} container
   * @param {object} data
   *   {
   *     playerName: "佐藤",
   *     currentHole: 1,
   *     par: 4,
   *     mode: "simple" | "counter",
   *     strokes: null | number,
   *     putts: null | number
   *   }
   * @param {object} handlers
   *   {
   *     onModeChange, onStrokesChange, onPuttsChange, onCommit
   *   }
   */
  render(container, data, handlers = {}) {
    container.innerHTML = "";
    container.className = "gl-inputpanel";

    // ---- モードタブ ----
    const tabs = document.createElement("div");
    tabs.className = "gl-inputpanel__modetabs";
    tabs.innerHTML = `
      <button class="gl-inputpanel__modetab ${data.mode === "simple" ? "gl-inputpanel__modetab--active" : ""}" data-mode="simple">シンプル</button>
      <button class="gl-inputpanel__modetab ${data.mode === "counter" ? "gl-inputpanel__modetab--active" : ""}" data-mode="counter">カウンター</button>
    `;
    container.appendChild(tabs);
    tabs.querySelectorAll("[data-mode]").forEach(el => {
      el.addEventListener("click", () => {
        if (handlers.onModeChange) handlers.onModeChange(el.dataset.mode);
      });
    });

    // ---- Body ----
    if (data.mode === "counter") {
      container.appendChild(this._renderCounter(data, handlers));
    } else {
      container.appendChild(this._renderSimple(data, handlers));
    }

    // ---- パット ----
    container.appendChild(this._renderPutt(data, handlers));

    // ---- 確定 ----
    const commit = document.createElement("div");
    commit.className = "gl-commit";
    commit.innerHTML = `<button class="gl-commit__btn" data-act="commit">✓ 確定</button>`;
    container.appendChild(commit);
    commit.querySelector('[data-act="commit"]').addEventListener("click", () => {
      if (handlers.onCommit) handlers.onCommit();
    });
  },

  /**
   * シンプル 5 ボタン: [−] [par-1] [par] [par+1] [+]
   * 両端は現在値からの ±1 微調整ボタン、中央3個は絶対値ダイレクト入力
   */
  _renderSimple(data, handlers) {
    const wrap = document.createElement("div");
    wrap.className = "gl-simple";
    const par = Number(data.par);
    const cur = data.strokes;

    // Par別のスコアラベル (差分から名前)
    const labelFor = (diff) => {
      if (diff <= -3) return "アルバ";
      if (diff === -2) return "イーグル";
      if (diff === -1) return "バーディ";
      if (diff === 0) return "パー";
      if (diff === 1) return "ボギー";
      if (diff === 2) return "Dボギー";
      if (diff >= 3) return "+" + diff;
      return "";
    };

    // ---- 5 ボタン定義 ----
    // 左端: −(現在値-1、下限1)
    // 中1: par-1 (バーディ)
    // 中2: par   (パー)
    // 中3: par+1 (ボギー)
    // 右端: +(現在値+1、上限15)
    const buttons = [
      { key: "minus",   cls: "gl-simple__btn--minus",  num: "−",     lbl: "" },
      { key: par - 1,   cls: "gl-simple__btn--birdie", num: par - 1, lbl: labelFor(-1) },
      { key: par,       cls: "gl-simple__btn--par",    num: par,     lbl: labelFor(0) },
      { key: par + 1,   cls: "gl-simple__btn--bogey",  num: par + 1, lbl: labelFor(1) },
      { key: "plus",    cls: "gl-simple__btn--plus",   num: "+",     lbl: "" }
    ];

    buttons.forEach(b => {
      const btn = document.createElement("button");
      btn.className = "gl-simple__btn " + b.cls;
      // アクティブ判定: 中央3個で cur が一致した時
      if (typeof b.key === "number" && cur === b.key) {
        btn.classList.add("gl-simple__btn--active");
      }
      btn.innerHTML = `<span class="num">${b.num}</span>${b.lbl ? `<span class="lbl">${b.lbl}</span>` : ""}`;
      btn.addEventListener("click", () => {
        if (!handlers.onStrokesChange) return;
        if (b.key === "minus") {
          // 現在値 -1 (未入力なら par -1 から開始)、下限1
          const base = (cur == null) ? par : cur;
          const next = Math.max(1, base - 1);
          handlers.onStrokesChange(next);
        } else if (b.key === "plus") {
          // 現在値 +1 (未入力なら par +1 から開始)、上限15
          const base = (cur == null) ? par : cur;
          const next = Math.min(15, base + 1);
          handlers.onStrokesChange(next);
        } else {
          // 中央3個: 直接入力
          handlers.onStrokesChange(b.key);
        }
      });
      wrap.appendChild(btn);
    });

    return wrap;
  },

  /**
   * カウンター: [−] 大数字 [＋]
   * 初期値は 0 (初心者は一打ごとに + を押してカウントアップする)
   */
  _renderCounter(data, handlers) {
    const wrap = document.createElement("div");
    wrap.className = "gl-counter";
    const cur = data.strokes;
    const par = Number(data.par);

    // − ボタン: 現在値 -1 (下限 0)
    const minus = document.createElement("button");
    minus.className = "gl-counter__btn gl-counter__btn--minus";
    minus.textContent = "−";
    minus.addEventListener("click", () => {
      const base = (cur == null) ? 0 : cur;
      const next = Math.max(0, base - 1);
      if (handlers.onStrokesChange) handlers.onStrokesChange(next);
    });

    // 中央ディスプレイ: 0 からスタート、パー差はスコアが入ってから表示
    const display = document.createElement("div");
    display.className = "gl-counter__display";
    const shown = (cur == null) ? 0 : cur;
    let diffText = "";
    if (cur != null && cur > 0) {
      const diff = cur - par;
      diffText = (diff === 0) ? "パー" : (diff > 0 ? `+${diff}` : `${diff}`);
    } else {
      diffText = "タップでカウント";
    }
    display.innerHTML = `<span class="num">${shown}</span><span class="lbl">${diffText}</span>`;

    // + ボタン: 現在値 +1 (初期 null なら 1 、上限 20)
    const plus = document.createElement("button");
    plus.className = "gl-counter__btn gl-counter__btn--plus";
    plus.textContent = "＋";
    plus.addEventListener("click", () => {
      const base = (cur == null) ? 0 : cur;
      const next = Math.min(20, base + 1);
      if (handlers.onStrokesChange) handlers.onStrokesChange(next);
    });

    wrap.appendChild(minus);
    wrap.appendChild(display);
    wrap.appendChild(plus);
    return wrap;
  },

  /**
   * パット 6 ボタン: [0][1][2][3][4][+]
   * 最後の + は現在値 +1 (現在 null なら 5 から開始、上限 20)
   */
  _renderPutt(data, handlers) {
    const wrap = document.createElement("div");
    wrap.className = "gl-putt";
    const cur = data.putts;
    wrap.innerHTML = `<div class="gl-putt__label">🚶 パット数 ${cur != null ? cur : ""}</div>`;
    const row = document.createElement("div");
    row.className = "gl-putt__row";

    // 0-4 の数字ボタン
    [0, 1, 2, 3, 4].forEach(n => {
      const btn = document.createElement("button");
      btn.className = "gl-putt__btn" + (cur === n ? " gl-putt__btn--active" : "");
      btn.textContent = String(n);
      btn.addEventListener("click", () => {
        if (handlers.onPuttsChange) handlers.onPuttsChange(n);
      });
      row.appendChild(btn);
    });
    // 5番目: + ボタン (カウントアップ)
    const plusBtn = document.createElement("button");
    plusBtn.className = "gl-putt__btn gl-putt__btn--plus" + (cur != null && cur >= 5 ? " gl-putt__btn--active" : "");
    // 現在値が 5 以上ならその数字を見せる、それ以外は +
    plusBtn.textContent = (cur != null && cur >= 5) ? String(cur) : "+";
    plusBtn.addEventListener("click", () => {
      if (!handlers.onPuttsChange) return;
      const base = (cur == null) ? 4 : cur;
      const next = Math.min(20, base + 1);
      handlers.onPuttsChange(next);
    });
    row.appendChild(plusBtn);

    wrap.appendChild(row);
    return wrap;
  }
};

if (typeof window !== "undefined") window.InputPanel = InputPanel;
