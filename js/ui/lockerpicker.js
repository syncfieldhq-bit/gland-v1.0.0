/* ========================================================
 * G-LAND v1.0.0 - Locker Number Picker Modal
 * 最大3桁のテンキー入力
 * ======================================================== */

const LockerPicker = {
  /**
   * @param {number|string} currentNum
   * @param {function(number)} onConfirm
   * @param {function()} onCancel
   */
  open(currentNum, onConfirm, onCancel) {
    this.close();

    let buf = String(currentNum || "").replace(/[^0-9]/g, "").slice(0, 3);

    const backdrop = document.createElement("div");
    backdrop.className = "gl-modal-backdrop";
    backdrop.id = "gl-lockerpicker-modal";

    const modal = document.createElement("div");
    modal.className = "gl-modal";
    modal.innerHTML = `
      <div class="gl-modal__title">🔒 ロッカー番号 (最大3桁)</div>
      <div class="gl-locker__display" id="gl-locker-display">${buf || "─"}</div>
      <div class="gl-locker__keypad">
        <button class="gl-locker__key" data-k="1">1</button>
        <button class="gl-locker__key" data-k="2">2</button>
        <button class="gl-locker__key" data-k="3">3</button>
        <button class="gl-locker__key" data-k="4">4</button>
        <button class="gl-locker__key" data-k="5">5</button>
        <button class="gl-locker__key" data-k="6">6</button>
        <button class="gl-locker__key" data-k="7">7</button>
        <button class="gl-locker__key" data-k="8">8</button>
        <button class="gl-locker__key" data-k="9">9</button>
        <button class="gl-locker__key gl-locker__key--fn" data-k="clear">C</button>
        <button class="gl-locker__key" data-k="0">0</button>
        <button class="gl-locker__key gl-locker__key--fn" data-k="back">⌫</button>
      </div>
      <div class="gl-modal__actions">
        <button class="gl-modal__btn gl-modal__btn--cancel" data-act="cancel">キャンセル</button>
        <button class="gl-modal__btn gl-modal__btn--ok" data-act="ok">✓ 決定</button>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const disp = modal.querySelector("#gl-locker-display");

    function update() {
      disp.textContent = buf || "─";
    }

    modal.querySelectorAll("[data-k]").forEach(btn => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.k;
        if (k === "clear") {
          buf = "";
        } else if (k === "back") {
          buf = buf.slice(0, -1);
        } else {
          if (buf.length < 3) buf += k;
        }
        update();
      });
    });

    modal.querySelector('[data-act="ok"]').addEventListener("click", () => {
      const val = buf ? parseInt(buf, 10) : null;
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

  close() {
    const el = document.getElementById("gl-lockerpicker-modal");
    if (el) el.remove();
  }
};

if (typeof window !== "undefined") window.LockerPicker = LockerPicker;
