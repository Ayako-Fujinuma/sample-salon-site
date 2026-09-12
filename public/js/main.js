(() => {
  const NOTICE_TOOLTIP = "サンプル:実際の運用ではGoogleスプレッドシートを編集するだけで更新できます";
  const NOTICE_ALERT = "サンプル：実際の運用では、Googleスプレッドシートを編集するだけでこのお知らせが自動的に更新されます(コード編集・再デプロイ不要)。";

  // ヘッダー(ロゴ+ナビ)の実際の高さを --header-h に反映する。
  // 画面幅によってナビが折り返しても、ヒーローやお知らせバナーがヘッダーと重ならないようにするため。
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    // 一旦 --header-h を外して本来の高さを測ってから反映する。
    // (measure → set の順で自分自身の min-height に書き戻すと、測定タイミング次第で値が肥大化したまま固定されるため)
    const applyHeaderHeight = () => {
      document.documentElement.style.setProperty("--header-h", "auto");
      const height = siteHeader.offsetHeight;
      document.documentElement.style.setProperty("--header-h", `${height}px`);
    };
    applyHeaderHeight();
    window.addEventListener("resize", applyHeaderHeight);
    window.addEventListener("load", applyHeaderHeight);
  }

  // Googleスプレッドシートを「ウェブに公開」した際のCSVをパースする(ダブルクォート内のカンマ・改行に対応)
  function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (inQuotes) {
        if (char === '"' && text[i + 1] === '"') {
          field += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    if (field !== "" || row.length) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }

  // CSVの1行目が見出し(日付/date等)ならスキップし、{ date, message } の配列に変換する
  function parseNoticesCsv(text) {
    const rows = parseCsvRows(text).filter((row) => row.length >= 2);
    if (rows.length === 0) return [];

    const firstCell = (rows[0][0] || "").trim().toLowerCase();
    const startIndex = firstCell === "date" || firstCell === "日付" ? 1 : 0;

    return rows
      .slice(startIndex)
      .map(([date, message]) => ({ date: (date || "").trim(), message: (message || "").trim() }))
      .filter((notice) => notice.message);
  }

  // 臨時休業のお知らせ
  // js/config.js の SHEET_CSV_URL が設定されていればGoogleスプレッドシート(CSV公開URL)から、
  // 未設定なら public/js/notices.json から読み込みます。設定方法は js/config.js を参照。
  const fetchNoticesJson = () => fetch("js/notices.json").then((res) => (res.ok ? res.json() : []));

  const sheetUrl = (window.NOTICE_CONFIG && window.NOTICE_CONFIG.SHEET_CSV_URL) || "";

  const fetchNotices = sheetUrl
    ? fetch(sheetUrl)
        .then((res) => (res.ok ? res.text() : Promise.reject(new Error("sheet fetch failed"))))
        .then(parseNoticesCsv)
        .catch(fetchNoticesJson)
    : fetchNoticesJson();

  fetchNotices
    .then((notices) => {
      if (!Array.isArray(notices) || notices.length === 0) return;

      const banner = document.getElementById("noticeBanner");
      const bannerList = document.getElementById("noticeList");
      const hoursNotice = document.getElementById("hoursNotice");
      const hoursNoticeList = document.getElementById("hoursNoticeList");

      notices.forEach((notice) => {
        if (!notice || !notice.message) return;

        const bannerItem = document.createElement("li");
        bannerItem.innerHTML = `<span class="notice-date">${notice.date ?? ""}</span>${notice.message}`;
        bannerItem.title = NOTICE_TOOLTIP;
        bannerItem.onclick = () => alert(NOTICE_ALERT);
        bannerList.appendChild(bannerItem);

        const hoursItem = document.createElement("li");
        hoursItem.textContent = notice.date ? `${notice.date}:${notice.message}` : notice.message;
        hoursItem.title = NOTICE_TOOLTIP;
        hoursItem.onclick = () => alert(NOTICE_ALERT);
        hoursNoticeList.appendChild(hoursItem);
      });

      banner.hidden = false;
      hoursNotice.hidden = false;
    })
    .catch(() => {
      // お知らせの取得に失敗しても通常表示は継続する
    });
})();
