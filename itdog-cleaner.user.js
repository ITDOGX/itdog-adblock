// ==UserScript==
// @name         ITDog 去广告清理
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动清理 itdog.cn 页面上的广告元素与无关模块，保持页面简洁。
// @author       https://github.com/ITDOGX
// @match        https://www.itdog.cn/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 需要删除的选择器
  const selectors = [
    // 精确样式的卡片
    "div.card.mb-0.rounded-lg[style*='padding: 5px'][style*='background-color: #fff']",

    // 指定 class 组合
    ".col-12.mb-3.gg_link",
    ".top_pic_ad.gg_link",

    // 删除所有带 gg_link 的元素（包含 lantern_* 等）
    ".gg_link"
  ];

  const combined = selectors.join(',');

  // 1) 页面尚未渲染前先隐藏，减少闪烁
  const style = document.createElement('style');
  style.textContent = `${combined} { display: none !important; }`;
  document.documentElement.appendChild(style);

  // 2) 实际从 DOM 中移除
  const removeMatches = (root = document) => {
    root.querySelectorAll(combined).forEach(el => el.remove());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => removeMatches(), { once: true });
  } else {
    removeMatches();
  }

  // 3) 监听后续动态插入的节点，发现即删除
  const obs = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (!m.addedNodes || m.addedNodes.length === 0) continue;
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue; // 仅处理元素节点
        if (node.matches && node.matches(combined)) {
          node.remove();
          continue;
        }
        if (node.querySelectorAll) {
          node.querySelectorAll(combined).forEach(el => el.remove());
        }
      }
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

})();
