/* ========================================================
 * G-LAND v1.0.0 - Time Picker Modal (Scroll Wheel)
 * 現在時刻 + 45分 を初期値、指スワイプで時分を選択
 * ハイライトバンドと選択中の数字を完全一致させる
 * ======================================================== */

const TimePicker = {
  open(currentTime, onConfirm, onCancel) {
    this.close();

    // 初期値決定
    let hh, mm;
    if (currentTime && /^\d{1,2}:\d{2}$/.test(currentTime)) {
      const parts = currentTime.split(":");
      hh = parseInt(parts[0], 10);
      mm = parseInt(parts[1], 10);
    } else {
      const now = new Date();
      const t = new Date(now.getTime() + 45 * 60 * 1000);
      hh = t.getHours();
      mm = t.getMinutes();
    }

    const backdrop = document.createElement("div");
    backdrop.className = "gl-modal-backdrop";
    backdrop.id = "gl-timepicker-modal";

    const modal = document.createElement("div");
    modal.className = "gl-modal";
    modal.innerHTML = `
      <div class="gl-modal__title">🕒 後半スタート時刻</div>
      <div class="gl-modal__hint">スワイプして時刻を選択</div>
      <div class="gl-wheel-picker">
        <div class="gl-wheel" id="gl-wheel-hh"></div>
        <div class="gl-wheel__colon">:</div>
        <div class="gl-wheel" id="gl-wheel-mm"></div>
      </div>
      <div class="gl-modal__actions">
        <button class="gl-modal__btn gl-modal__btn--cancel" data-act="cancel">キャンセル</button>
        <button class="gl-modal__btn gl-modal__btn--ok" data-act="ok">✓ 決定</button>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const state = { hh, mm };
    this._buildWheel(modal.querySelector("#gl-wheel-hh"), 0, 23, hh, (v) => { state.hh = v; });
    this._buildWheel(modal.querySelector("#gl-wheel-mm"), 0, 59, mm, (v) => { state.mm = v; });

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    modal.querySelector('[data-act="ok"]').addEventListener("click", () => {
      const val = pad(state.hh) + ":" + pad(state.mm);
      this.close();
      if (onConfirm) onConfirm(val);
    });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", () => {
      this.close();
      if (onCancel) onCancel();
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        this.close();
        if (onCancel) onCancel();
      }
    });
  },

  /**
   * ホイール構築ロジック v1.3.1:
   * - ホイール全体高さ = 340px
   * - 各アイテム高さ = 60px、中央行がアクティブ
   * - CSS で上下 140px の padding = (340-60)/2
   */
  _buildWheel(el, min, max, initial, onChange) {
    const itemHeight = 60;

    let html = "";
    for (let v = min; v <= max; v++) {
      html += `<div class="gl-wheel__item" data-v="${v}">${v < 10 ? "0" + v : v}</div>`;
    }
    el.innerHTML = html;

    // 初期位置: initial の index * itemHeight にスクロール
    const setToValue = (v) => {
      const idx = v - min;
      el.scrollTop = idx * itemHeight;
    };
    // 直後にセット + 次フレームでも再度セット (レイアウト確定後)
    setToValue(initial);
    requestAnimationFrame(() => setToValue(initial));

    let scrollTimer = null;
    const updateFromScroll = () => {
      const idx = Math.round(el.scrollTop / itemHeight);
      const v = min + Math.max(0, Math.min(max - min, idx));
      // アクティブ表示
      el.querySelectorAll(".gl-wheel__item").forEach((item, i) => {
        item.classList.toggle("gl-wheel__item--active", i === idx);
      });
      onChange(v);
    };
    updateFromScroll();

    el.addEventListener("scroll", () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      updateFromScroll();
      scrollTimer = setTimeout(() => {
        // スナップ
        const idx = Math.round(el.scrollTop / itemHeight);
        el.scrollTop = idx * itemHeight;
        updateFromScroll();
      }, 120);
    });

    // タップで直接値を指定
    el.querySelectorAll("[data-v]").forEach(item => {
      item.addEventListener("click", () => {
        const v = parseInt(item.dataset.v, 10);
        setToValue(v);
        updateFromScroll();
      });
    });
  },

  close() {
    const el = document.getElementById("gl-timepicker-modal");
    if (el) el.remove();
  }
};

if (typeof window !== "undefined") window.TimePicker = TimePicker;
