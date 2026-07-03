/* ========================================================
 * G-LAND v1.0.0 - Score Table (Sections + Correct Total Diff)
 * - compact / wide 両方で OUT/IN 集計列を挟む
 * - TOTAL 差分 = 入力済みホールだけの par 合計と比較 (正しいゴルフ表示)
 * ======================================================== */

const ScoreTable = {
  render(container, data, handlers = {}) {
    container.innerHTML = "";
    container.className = "gl-scoretable gl-scoretable--" + (data.mode || "wide");

    const players = data.players || [];
    if (!players.length) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:#9e9e9e">プレイヤーがいません</div>';
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "gl-scoretable__wrap";
    container.appendChild(wrap);

    const table = document.createElement("table");
    table.className = "gl-scoretable__table";
    wrap.appendChild(table);

    // すべてのモードで sections (OUT/IN) を挟む
    const sections = this._buildSections(players[0].holes, data.structure);

    // ==== Header ====
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.innerHTML = `<th class="gl-col-name">プレイヤー</th>`;
    sections.forEach(sec => {
      sec.holes.forEach(h => {
        const isCurrent = (h.holeNumber === data.currentHole);
        trHead.innerHTML += `<th class="${isCurrent ? "gl-col-current" : ""}" data-hole="${h.holeNumber}">${h.holeNumber}H</th>`;
      });
      if (sec.summary) trHead.innerHTML += `<th class="summary gl-col-summary">${sec.summary}</th>`;
    });
    trHead.innerHTML += `<th class="total gl-col-total">TOTAL</th>`;
    thead.appendChild(trHead);
    table.appendChild(thead);

    // ==== Body ====
    const tbody = document.createElement("tbody");

    players.forEach((player, idx) => {
      const showPar = (idx === 0);
      const showPutt = (data.mode === "compact" && player.isSelf);

      // ---- PAR 行 (先頭のみ) ----
      if (showPar) {
        const trPar = document.createElement("tr");
        trPar.className = "gl-row-par";
        trPar.innerHTML = `<td class="gl-col-name">PAR</td>`;
        let totalPar = 0;
        sections.forEach(sec => {
          let secPar = 0;
          sec.holes.forEach(h => {
            const isCurrent = (h.holeNumber === data.currentHole);
            secPar += h.par || 0;
            trPar.innerHTML += `<td class="${isCurrent ? "gl-col-current" : ""}" data-hole="${h.holeNumber}">${h.par}</td>`;
          });
          totalPar += secPar;
          if (sec.summary) trPar.innerHTML += `<td class="summary gl-col-summary">${secPar}</td>`;
        });
        trPar.innerHTML += `<td class="total gl-col-total">${totalPar}</td>`;
        tbody.appendChild(trPar);
      }

      // ---- プレイヤー行 ----
      const trPlayer = document.createElement("tr");
      trPlayer.className = "gl-row-player" + (player.isSelf ? " gl-row-player--self" : "");
      trPlayer.innerHTML = `<td class="gl-col-name">${player.name || "?"}${player.isSelf ? '<span class="gl-tag-self">自分</span>' : ""}</td>`;

      // 各セクション別スコア + 全体集計
      let allTotalStrokes = 0;
      let allTotalPar = 0;  // 入力済みホールだけの par 合計
      let hasAnyStrokes = false;

      const renderCell = (h) => {
        const isCurrent = (h.holeNumber === data.currentHole);
        const cls = isCurrent ? "gl-col-current" : "";
        if (h.strokes != null && h.strokes > 0) {
          const text = ScoreFormat.format(h.strokes, h.par, data.displayMode);
          return `<td class="${cls}" data-hole="${h.holeNumber}">${text}</td>`;
        } else {
          return `<td class="${cls} gl-cell-empty" data-hole="${h.holeNumber}">─</td>`;
        }
      };

      sections.forEach(sec => {
        let secStrokes = 0;
        let secHasAny = false;
        sec.holes.forEach(refH => {
          const h = player.holes.find(x => x.holeNumber === refH.holeNumber) || refH;
          trPlayer.innerHTML += renderCell(h);
          if (h.strokes != null && h.strokes > 0) {
            secStrokes += Number(h.strokes);
            allTotalStrokes += Number(h.strokes);
            allTotalPar += (h.par || 0);  // 入力済みホールの par だけ足す
            secHasAny = true;
            hasAnyStrokes = true;
          }
        });
        if (sec.summary) {
          trPlayer.innerHTML += `<td class="summary gl-col-summary">${secHasAny ? secStrokes : "─"}</td>`;
        }
      });

      if (hasAnyStrokes) {
        const diff = ScoreFormat.totalDiff(allTotalStrokes, allTotalPar);
        trPlayer.innerHTML += `<td class="total gl-col-total">${allTotalStrokes}<span class="plusminus">${diff}</span></td>`;
      } else {
        trPlayer.innerHTML += `<td class="total gl-col-total">─</td>`;
      }

      tbody.appendChild(trPlayer);

      // ---- パット行 (compact + 自分のみ) ----
      if (showPutt) {
        const trPutt = document.createElement("tr");
        trPutt.className = "gl-row-putt";
        trPutt.innerHTML = `<td class="gl-col-name"><span class="putt-icon">🚶</span>パット</td>`;
        let allTotalPutts = 0;
        let hasAnyPutts = false;
        sections.forEach(sec => {
          let secPutts = 0;
          let secHasPutt = false;
          sec.holes.forEach(refH => {
            const h = player.holes.find(x => x.holeNumber === refH.holeNumber) || refH;
            const isCurrent = (h.holeNumber === data.currentHole);
            const cls = isCurrent ? "gl-col-current" : "";
            if (h.putts != null && h.putts !== "") {
              trPutt.innerHTML += `<td class="${cls}" data-hole="${h.holeNumber}">${h.putts}</td>`;
              secPutts += Number(h.putts);
              allTotalPutts += Number(h.putts);
              secHasPutt = true;
              hasAnyPutts = true;
            } else {
              trPutt.innerHTML += `<td class="${cls} gl-cell-empty" data-hole="${h.holeNumber}">─</td>`;
            }
          });
          if (sec.summary) {
            trPutt.innerHTML += `<td class="summary gl-col-summary">${secHasPutt ? secPutts : "─"}</td>`;
          }
        });
        trPutt.innerHTML += `<td class="total gl-col-total">${hasAnyPutts ? allTotalPutts : "─"}</td>`;
        tbody.appendChild(trPutt);
      }
    });

    table.appendChild(tbody);

    // タップでハイライト移動
    if (handlers.onCellTap) {
      wrap.querySelectorAll("td[data-hole], th[data-hole]").forEach(el => {
        el.addEventListener("click", () => {
          handlers.onCellTap(Number(el.dataset.hole));
        });
      });
    }

    // 列幅を均等割 (compact=3 中央ホール, wide=5 中央ホール)
    const visibleCount = (data.mode === "compact") ? 3 : 5;
    this._adjustHoleWidth(container, wrap, visibleCount);

    // ハイライトを中央にスクロール
    // ここは初回描画時だけ・もしくはタブ切替時だけにするべき。
    // 但し、scrollアニメーションを "instant" にして 1H → 目的ホールという見え方を回避
    this._scrollToCurrent(container, wrap, data.currentHole);
  },

  _buildSections(holes, structure = "18h") {
    if (structure === "9x2") {
      return [
        { holes: holes.filter(h => h.holeNumber >= 1 && h.holeNumber <= 9), summary: "1st" },
        { holes: holes.filter(h => h.holeNumber >= 10 && h.holeNumber <= 18), summary: "2nd" }
      ];
    }
    if (structure === "27h") {
      return [
        { holes: holes.filter(h => h.holeNumber >= 1 && h.holeNumber <= 9), summary: "OUT" },
        { holes: holes.filter(h => h.holeNumber >= 10 && h.holeNumber <= 18), summary: "IN" },
        { holes: holes.filter(h => h.holeNumber >= 19 && h.holeNumber <= 27), summary: "IN2" }
      ];
    }
    // 18h デフォルト
    return [
      { holes: holes.filter(h => h.holeNumber >= 1 && h.holeNumber <= 9), summary: "OUT" },
      { holes: holes.filter(h => h.holeNumber >= 10 && h.holeNumber <= 18), summary: "IN" }
    ];
  },

  /**
   * 全体 = プレイヤー列 + n ホール列 + summary 列2つ + TOTAL列 = n + 4
   * compact (n=3) → 7分割、wide (n=5) → 9分割
   */
  /**
   * 初回表示: プレイヤー列 + 中央 n ホール列 + TOTAL列 = ちょうど n+2 列分の幅で埋める
   */
  _adjustHoleWidth(container, wrap, visibleCount) {
    const n = visibleCount || 5;
    const totalCols = n + 2;
    const setWidth = () => {
      const wrapW = wrap.clientWidth || wrap.offsetWidth;
      if (!wrapW) return;
      const w = Math.max(40, Math.floor(wrapW / totalCols));
      container.style.setProperty("--gl-hole-w", w + "px");
      container.style.setProperty("--gl-summary-w", Math.floor(w * 0.7) + "px");
    };
    // 同期に1回だけセット。setTimeout なし (古い wrap を参照するバグ対策)
    setWidth();
    // resize リスナーは window 単位で一度だけ登録し、現在の wrap は都度 DOM から探す
    if (!window._gl_resize_bound) {
      window.addEventListener("resize", () => {
        document.querySelectorAll(".gl-scoretable").forEach(c => {
          const w = c.querySelector(".gl-scoretable__wrap");
          if (!w) return;
          const isCompact = c.classList.contains("gl-scoretable--compact");
          const cnt = isCompact ? 3 : 5;
          const wrapW = w.clientWidth || w.offsetWidth;
          if (!wrapW) return;
          const hw = Math.max(40, Math.floor(wrapW / (cnt + 2)));
          c.style.setProperty("--gl-hole-w", hw + "px");
          c.style.setProperty("--gl-summary-w", Math.floor(hw * 0.7) + "px");
        });
      });
      window._gl_resize_bound = true;
    }
  },

  /**
   * ハイライトセルを中央にスクロール。
   * 重要: 同一セル内のコンテナに属する prev/curr ハイライトを見分けて、
   * 新しいホールの cell.offsetLeft の値が確定してからスクロールする。
   */
  _scrollToCurrent(container, wrap, holeNumber) {
    if (!holeNumber) return;
    const doScroll = () => {
      try {
        const cell = wrap.querySelector(`.gl-row-player td[data-hole="${holeNumber}"]`);
        if (!cell) return;
        const cellLeft = cell.offsetLeft;
        const cellW = cell.offsetWidth;
        const wrapW = wrap.clientWidth || wrap.offsetWidth;
        if (!wrapW || !cellW) return;  // サイズ未確定ならスキップ
        // プレイヤー列(sticky左) の分はスクロールに入らないので、
        // 実際に見える中央 = (wrapW - stickyLeft - stickyRight) / 2
        // だが単純に cellLeft - wrapW/2 + cellW/2 で十分だという実験結果もあるのでそちらを採用
        const target = cellLeft - (wrapW / 2) + (cellW / 2);
        wrap.scrollLeft = Math.max(0, target);
      } catch (e) { /* ignore */ }
    };
    // レイアウト確定後に 2 回試行 (rAF で1回、setTimeout でフォローアップ)
    requestAnimationFrame(() => {
      doScroll();
      requestAnimationFrame(doScroll);
    });
  }
};

if (typeof window !== "undefined") window.ScoreTable = ScoreTable;
