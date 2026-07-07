/* ============================================================
 * G-LAND API Client (v85 通信基盤を移植)
 * ------------------------------------------------------------
 * GAS ウェブアプリと通信するためのユーティリティ。
 * config.js の GLAND_CONFIG.GAS_WEB_APP_URL に GAS の /exec URL を設定して使う。
 *
 * 使い方:
 *   glandApi('apiHealthCheck').then(function(r){ console.log(r); });
 *   glandApi('apiJoinRound', { groupId: 'R-DEMO-001', userId: 'U-001' })
 *     .then(function(r){ ... });
 * ============================================================ */
(function () {
  var API_TIMEOUT = 20000; // 20秒

  function getUrl() {
    var cfg = window.GLAND_CONFIG || {};
    return cfg.GAS_WEB_APP_URL || '';
  }

  function isConfigured() {
    var url = getUrl();
    return !!(url && !/REPLACE_WITH/.test(url));
  }

  function api(name) {
    var args = Array.prototype.slice.call(arguments, 1);
    // v72.2.1 の呼び出し形式を全部吸収 (単一 payload / 位置引数 の両対応)
    var payload = args.length === 0 ? {}
                : (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) ? args[0]
                : {
                    _args: args, _legacy: true,
                    roundId:    args[0],
                    patch:      args[1],
                    userId:     args[1],
                    playerName: args[1],
                    playerType: args[2],
                    holeNo:     args[3],
                    par:        args[4],
                    stroke:     args[5],
                    putt:       args[6],
                    items:      args[1]
                  };

    var url = getUrl();
    if (!url || /REPLACE_WITH/.test(url)) {
      console.warn('[GL API STUB]', name, args, 'GAS_WEB_APP_URL not configured');
      return Promise.resolve({ ok: false, error: 'GAS_WEB_APP_URL not configured', _offline: true });
    }

    return new Promise(function (resolve) {
      var settled = false;
      var to = setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve({ ok: false, error: 'timeout', _timeout: true });
      }, API_TIMEOUT);

      fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ fn: name, payload: payload })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (t) {
        if (settled) return;
        if (!t || !t.trim()) {
          settled = true; clearTimeout(to);
          return resolve({ ok: false, error: 'empty response' });
        }
        var parsed;
        try {
          parsed = JSON.parse(t);
        } catch (e) {
          settled = true; clearTimeout(to);
          return resolve({ ok: false, error: 'JSON parse: ' + t.substring(0, 200) });
        }
        settled = true; clearTimeout(to);
        if (parsed && parsed.ok === false) {
          resolve({ ok: false, error: parsed.error || 'server error' });
        } else if (parsed && parsed.data !== undefined) {
          var inner = parsed.data;
          if (inner && typeof inner === 'object' && 'ok' in inner) {
            resolve(inner);
          } else {
            resolve(Object.assign({ ok: true }, (inner && typeof inner === 'object' ? inner : { value: inner })));
          }
        } else {
          resolve(parsed);
        }
      }).catch(function (err) {
        if (settled) return;
        settled = true; clearTimeout(to);
        resolve({ ok: false, error: (err && err.message) || String(err) });
      });
    });
  }

  // グローバルに公開（既存コードから呼びやすい名前2つ）
  window.glandApi = api;
  window.gwApi    = api;  // v85 互換
  window.glandApiIsConfigured = isConfigured;

  /* ============================================================
   *  プロフィール同期ヘルパー
   * ------------------------------------------------------------
   *  g-land のプロフィール構造 { nickname, lastName, lastNameKana,
   *  firstName, firstNameKana } を v85 の形式に変換して送信する。
   *  返ってきた userId を localStorage に保存する。
   * ============================================================ */
  var USER_ID_KEY = 'gl_user_id_v1';

  function getStoredUserId() {
    try { return localStorage.getItem(USER_ID_KEY) || ''; } catch (e) { return ''; }
  }

  function setStoredUserId(id) {
    try { if (id) localStorage.setItem(USER_ID_KEY, id); } catch (e) {}
  }

  // g-land profile → v85 payload に変換
  // v2.4.1: GAS側の必須を「姓+姓カナ」の2項目のみに緩和したので、他項目は空文字OK
  function toV85Payload(profile) {
    var p = profile || {};
    return {
      nickname:   p.nickname     || '',
      familyName: p.lastName     || '',
      familyKana: p.lastNameKana || '',
      firstName:  p.firstName    || '',
      firstKana:  p.firstNameKana|| ''
    };
  }

  /**
   * プロフィールを GAS に同期する。
   * 新規なら apiRegisterUser、既存 userId があれば apiUpdateUser。
   * 成功時: { ok:true, userId, user }
   * 失敗時: { ok:false, error, _offline? }
   */
  function syncProfileToServer(profile) {
    if (!isConfigured()) {
      return Promise.resolve({ ok: false, error: 'not configured', _offline: true });
    }
    var payload = toV85Payload(profile);
    var existingId = getStoredUserId();
    if (existingId) {
      // 既存ユーザー → 更新
      return api('apiUpdateUser', { userId: existingId, patch: payload }).then(function (r) {
        if (r && r.ok) {
          return { ok: true, userId: existingId, user: r.user || null, updated: true };
        }
        // 更新失敗（サーバー側で当該ユーザー消失など）→ 新規登録にフォールバック
        return api('apiRegisterUser', payload).then(function (r2) {
          if (r2 && r2.ok && r2.user && r2.user.userId) {
            setStoredUserId(r2.user.userId);
            return { ok: true, userId: r2.user.userId, user: r2.user, created: true };
          }
          return { ok: false, error: (r2 && r2.error) || 'register failed' };
        });
      });
    }
    // 新規登録
    return api('apiRegisterUser', payload).then(function (r) {
      if (r && r.ok && r.user && r.user.userId) {
        setStoredUserId(r.user.userId);
        return { ok: true, userId: r.user.userId, user: r.user, created: true };
      }
      return { ok: false, error: (r && r.error) || 'register failed' };
    });
  }

  // グローバル公開
  window.glandSyncProfile   = syncProfileToServer;
  window.glandGetUserId     = getStoredUserId;
  window.glandSetUserId     = setStoredUserId;
})();
