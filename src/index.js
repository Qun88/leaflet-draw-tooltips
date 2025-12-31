/**
 * Leaflet Draw External Tooltip Plugin
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 * @copyright (c) 2025
 * @description External tooltip plugin for Leaflet.draw - move drawing hints outside the map
 * @repository https://github.com/yourusername/leaflet-draw-tooltips
 */

/**
 * leaflet-draw 外部 Tooltip 模组
 * 对外唯一入口
 */

import { findElement } from './dom.js';
import { ExternalCardTooltip } from './ExternalCardTooltip.js';
import { patchDrawTooltip } from './patchDrawTooltip.js';

/**
 * 安装 leaflet-draw 外部 Tooltip
 * 必须在 new L.Control.Draw() 之前调用
 * 
 * @param {Object} options
 * @param {L.Map} options.map - Leaflet 地图实例（必填）
 * @param {HTMLElement|string} options.el - 外部容器元素或选择器（必填）
 * @param {boolean} [options.hideMapTooltip=true] - 是否隐藏地图内原生 tooltip
 * @param {boolean} [options.sanitize=true] - 是否转义 HTML，防止 XSS
 * @param {Function} [options.onUpdate] - 状态更新回调 (content, state) => void
 * 
 * @throws {Error} 如果参数不合法或环境不满足
 * 
 * @example
 * installLeafletDrawExternalTooltip({
 *   map: myMap,
 *   el: '#draw-hint',
 *   hideMapTooltip: true,
 *   sanitize: true,
 *   onUpdate: (content, state) => {
 *     console.log('状态更新:', content, state);
 *   }
 * });
 * 
 * const drawControl = new L.Control.Draw({ ... });
 * myMap.addControl(drawControl);
 */
export function installLeafletDrawExternalTooltip(options = {}) {
  // 1. 参数校验
  const {
    map,
    el,
    hideMapTooltip = true,
    sanitize = true,
    onUpdate = null
  } = options;
  
  if (!map || typeof map.on !== 'function') {
    throw new Error('[leaflet-draw-tooltip] options.map 必须是有效的 Leaflet Map 实例');
  }
  
  if (!el) {
    throw new Error('[leaflet-draw-tooltip] options.el 必须提供（HTMLElement 或选择器）');
  }
  
  // 2. 查找容器元素
  const containerEl = findElement(el);
  
  // 3. 隐藏地图内原生 tooltip
  if (hideMapTooltip) {
    const mapContainer = map.getContainer();
    if (mapContainer) {
      mapContainer.classList.add('leaflet-draw-tooltip-hide');
    }
  }
  
  // 4. 准备配置对象并创建共享 ExternalCardTooltip 实例
  const tooltipConfig = {
    containerEl,
    sanitize,
    onUpdate
  };

  // 5. 创建共享实例并让 patch 使用该实例（避免绘制期间产生命名冲突/覆盖）
  const sharedExternalTooltip = new ExternalCardTooltip(tooltipConfig);
  patchDrawTooltip(sharedExternalTooltip);
  
  // 8. 返回清理函数和 tooltip 实例
  const cleanup = function() {
    // 仅在卸载插件时彻底 dispose 共享实例
    if (sharedExternalTooltip) {
      sharedExternalTooltip.dispose();
    }

    if (hideMapTooltip) {
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.classList.remove('leaflet-draw-tooltip-hide');
      }
    }
  };

  return {
    cleanup,
    tooltip: sharedExternalTooltip
  };
}
