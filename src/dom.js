/**
 * Leaflet Draw External Tooltip Plugin
 * @version 1.0.0
 * @license MIT
 * @copyright (c) 2025
 */

/**
 * DOM 工具模块
 * 提供 DOM 查找、样式注入、HTML 转义等功能
 */

/**
 * 查找 DOM 元素
 * @param {HTMLElement|string} selector - DOM 元素或选择器
 * @returns {HTMLElement}
 * @throws {Error} 如果找不到元素
 */
export function findElement(selector) {
  if (selector instanceof HTMLElement) {
    return selector;
  }
  
  if (typeof selector === 'string') {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`[leaflet-draw-tooltip] 找不到元素: ${selector}`);
    }
    return element;
  }
  
  throw new Error('[leaflet-draw-tooltip] el 必须是 HTMLElement 或选择器字符串');
}

/**
 * 注入 CSS 样式
 * @param {string} css - CSS 内容
 * @param {string} id - style 标签的 id
 */
export function injectStyle(css, id) {
  // 避免重复注入
  if (document.getElementById(id)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * HTML 转义，防止 XSS
 * @param {string} str - 要转义的字符串
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 批量设置元素内容（支持转义）
 * @param {HTMLElement} element - 目标元素
 * @param {string} content - 内容
 * @param {boolean} sanitize - 是否转义
 */
export function setContent(element, content, sanitize = true) {
  if (!element) return;
  
  if (sanitize) {
    element.textContent = content || '';
  } else {
    element.innerHTML = content || '';
  }
}
