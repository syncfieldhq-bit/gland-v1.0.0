/* ========================================================
 * G-LAND v1.0.0 - Input Panel (Legacy Layout)
 * 5 パステルボタン + パット行（ラベル+4ボタン+［+］）+ 確定 1 個
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
   */
  _renderSimple(data, handlers) {
    const wrap = document.createElement("div");
    wrap.className = "gl-simple";
    const par = Number(data.par);
    const cur = data.strokes;

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
      if (typeof b.key === "number" && cur === b.key) {
        btn.classList.add("gl-simple__btn--active");
      }
      btn.innerHTML = `<span class="num">${b.num}</span>${b.lbl ? `<span class="lbl">${b.lbl}</span>` : ""}`;
      btn.addEventListener("click", () => {
        if (!handlers.onStrokesChange) return;
        if (b.key === "minus") {
          const base = (cur == null) ? par : cur;
          const next = Math.max(1, base - 1);
          handlers.onStrokesChange(next);
        } else if (b.key === "plus") {
          const base = (cur == null) ? par : cur;
          const next = Math.min(15, base + 1);
          handlers.onStrokesChange(next);
        } else {
          handlers.onStrokesChange(b.key);
        }
      });
      wrap.appendChild(btn);
    });

    return wrap;
  },

  /**
   * カウンター: [−] 大数字 [＋]
   */
  _renderCounter(data, handlers) {
    const wrap = document.createElement("div");
    wrap.className = "gl-counter";
    const cur = data.strokes;
    const par = Number(data.par);

    const minus = document.createElement("button");
    minus.className = "gl-counter__btn gl-counter__btn--minus";
    minus.textContent = "−";
    minus.addEventListener("click", () => {
      const base = (cur == null) ? 0 : cur;
      const next = Math.max(0, base - 1);
      if (handlers.onStrokesChange) handlers.onStrokesChange(next);
    });

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
   * パット行: [パット] [0] [1] [2] [3] [+]
   * ラベルとボタンを1行に統合してコンパクト化
   * （老眼配慮・Android 確定ボタン見切れ対策・独立ラベル行を廃止）
   * + ボタンは現在値 +1 (現在 null または 3 なら 4 から開始、上限 20)
   */
  _renderPutt(data, handlers) {
    const wrap = document.createElement("div");
    wrap.className = "gl-putt";
    const cur = data.putts;

    const row = document.createElement("div");
    row.className = "gl-putt__row";

    // 先頭: ラベル（ボタンではなく静的表示）
    const label = document.createElement("div");
    label.className = "gl-putt__label-inline";
    label.textContent = "パット";
    row.appendChild(label);

    // 0-3 の数字ボタン
    [0, 1, 2, 3].forEach(n => {
      const btn = document.createElement("button");
      btn.className = "gl-putt__btn" + (cur === n ? " gl-putt__btn--active" : "");
      btn.textContent = String(n);
      btn.addEventListener("click", () => {
        if (handlers.onPuttsChange) handlers.onPuttsChange(n);
      });
      row.appendChild(btn);
    });

    // 末尾: + ボタン (カウントアップ、4パット以上に対応)
    const plusBtn = document.createElement("button");
    plusBtn.className = "gl-putt__btn gl-putt__btn--plus" + (cur != null && cur >= 4 ? " gl-putt__btn--active" : "");
    plusBtn.textContent = (cur != null && cur >= 4) ? String(cur) : "+";
    plusBtn.addEventListener("click", () => {
      if (!handlers.onPuttsChange) return;
      const base = (cur == null) ? 3 : cur;
      const next = Math.min(20, base + 1);
      handlers.onPuttsChange(next);
    });
    row.appendChild(plusBtn);

    wrap.appendChild(row);
    return wrap;
  }
};

if (typeof window !== "undefined") window.InputPanel = InputPanel;
