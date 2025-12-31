/**
 * Leaflet Draw External Tooltip Plugin
 * @version 1.0.0
 * @license MIT
 * @copyright (c) 2025
 */

/**
 * Runtime 替换 L.Draw.Tooltip
 * 将原生 tooltip 替换为外部 tooltip 的 Adapter
 */

import { ExternalCardTooltip } from './ExternalCardTooltip.js';

/**
 * 替换 L.Draw.Tooltip 为外部 tooltip 适配器
 * @param {Object} config - 配置对象（而不是实例）
 * @param {HTMLElement} config.containerEl - 外部容器元素
 * @param {boolean} config.sanitize - 是否转义 HTML
 * @param {Function} config.onUpdate - 状态更新回调
 */
export function patchDrawTooltip(configOrInstance) {
  if (typeof L === 'undefined' || !L.Draw || !L.Draw.Tooltip) {
    throw new Error('[leaflet-draw-tooltip] Leaflet.draw 未加载，请确保在加载 leaflet-draw 之后调用');
  }

  // 如果传入的是已有的 ExternalCardTooltip 实例，则复用；否则根据 config 创建一个共享实例
  const sharedExternalTooltip =
    configOrInstance && configOrInstance instanceof ExternalCardTooltip
      ? configOrInstance
      : new ExternalCardTooltip(configOrInstance || {});

  // 保存原始类（可选，用于调试）
  const OriginalTooltip = L.Draw.Tooltip;

  /**
   * 新的 L.Draw.Tooltip 适配器
   * 所有实例都共享同一个 ExternalCardTooltip
   */
  L.Draw.Tooltip = L.Class.extend({
    initialize: function(map) {
      // 复用共享实例
      this._externalTooltip = sharedExternalTooltip;
    },
    
    /**
     * 更新内容
     */
    updateContent: function(content) {
      this._externalTooltip.updateContent(content);
      return this;
    },
    
    /**
     * 更新位置（外部 tooltip 不使用，但必须存在）
     */
    updatePosition: function(latlng) {
      this._externalTooltip.updatePosition(latlng);
      return this;
    },
    
    /**
     * 显示为错误态
     */
    showAsError: function() {
      this._externalTooltip.showAsError();
      return this;
    },
    
    /**
     * 移除错误态
     */
    removeError: function() {
      this._externalTooltip.removeError();
      return this;
    },
    
    /**
     * 销毁
     */
    dispose: function() {
      // 不在此处 dispose 共享实例（以免被局部销毁）。
      return this;
    },

    /**
     * 空实现，避免调用时报错
     */
    _onMouseOut: function() {
      return;
    }
  });
  
  // 标记已替换（可用于调试）
  L.Draw.Tooltip._isPatched = true;
  L.Draw.Tooltip._originalClass = OriginalTooltip;
  // 暴露共享实例以便调试或外部访问
  L.Draw.Tooltip._sharedExternalTooltip = sharedExternalTooltip;

  return sharedExternalTooltip;
}
