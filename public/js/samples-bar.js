// 全デザイン案共通：最上部バー(案内+タブ)の実際の高さを --samples-bar-h に反映する。
// フォント読み込み等でテキストの折り返しが変わっても、下のヘッダーと重ならないようにするため。
(() => {
  const bar = document.querySelector(".samples-bar");
  if (!bar) return;

  const applyHeight = () => {
    document.documentElement.style.setProperty("--samples-bar-h", `${bar.offsetHeight}px`);
  };

  applyHeight();
  window.addEventListener("resize", applyHeight);
  window.addEventListener("load", applyHeight);
})();
