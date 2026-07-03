/* ========================================================
 * G-LAND v1.0.0 - QR Code Modal
 * 招待URL を QR 表示 + コピーボタン
 * ======================================================== */

const QRModal = {
  /**
   * @param {string} url - 招待URL
   * @param {string} title
   */
  open(url, title) {
    this.close();

    const backdrop = document.createElement("div");
    backdrop.className = "gl-modal-backdrop";
    backdrop.id = "gl-qrmodal";

    const qrSrc = window.QRCodeMini
      ? QRCodeMini.toDataURL(url, 220)
      : "";

    const modal = document.createElement("div");
    modal.className = "gl-modal";
    modal.innerHTML = `
      <div class="gl-modal__title">📷 ${title || "招待QR"}</div>
      <div class="gl-qr__body">
        <img class="gl-qr__img" src="${qrSrc}" alt="QR" width="220" height="220" onerror="this.style.display='none';document.getElementById('gl-qr-fallback').style.display='block'">
        <div id="gl-qr-fallback" class="gl-qr__fallback" style="display:none">
          QR画像を読み込めませんでした<br>URL をコピーしてください
        </div>
      </div>
      <div class="gl-qr__urlbox">
        <div class="gl-qr__url" id="gl-qr-url">${escapeHtml(url)}</div>
        <button class="gl-qr__copy" data-act="copy">📋 コピー</button>
      </div>
      <div class="gl-modal__actions">
        <button class="gl-modal__btn gl-modal__btn--ok" data-act="close">閉じる</button>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    modal.querySelector('[data-act="copy"]').addEventListener("click", () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          const btn = modal.querySelector('[data-act="copy"]');
          btn.textContent = "✓ コピー済み";
          setTimeout(() => { btn.textContent = "📋 コピー"; }, 1500);
        }).catch(() => alert("コピーに失敗: " + url));
      } else {
        alert("URL: " + url);
      }
    });
    modal.querySelector('[data-act="close"]').addEventListener("click", () => this.close());
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });
  },

  close() {
    const el = document.getElementById("gl-qrmodal");
    if (el) el.remove();
  }
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

if (typeof window !== "undefined") window.QRModal = QRModal;
