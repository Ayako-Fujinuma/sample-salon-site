// デザイン案2以降共通：ヘッダー(ロゴ+ナビ)の実際の高さを --header-h に反映する。
// 画面幅によってロゴとナビが2段になっても、ヒーロー等がヘッダーと重ならないようにするため。
(() => {
  const headers = document.querySelectorAll(".js-dynamic-header");
  if (!headers.length) return;

  // 一旦 --header-h を外して本来の高さを測ってから反映する。
  // (measure → set の順で自分自身の min-height に書き戻すと、測定タイミング次第で値が肥大化したまま固定されるため)
  const apply = () => {
    document.documentElement.style.setProperty("--header-h", "auto");
    headers.forEach((header) => {
      document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
    });
  };

  apply();
  window.addEventListener("resize", apply);
  window.addEventListener("load", apply);
})();
