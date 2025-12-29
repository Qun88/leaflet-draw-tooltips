/**
 * Leaflet Draw External Tooltip Plugin
 * @version 1.0.0
 * @license MIT
 * @copyright (c) 2025
 */

/**
 * ExternalCardTooltip
 * 外部 Tooltip 实现，符合 leaflet-draw 隐式接口
 */

import { setContent } from './dom.js';

export class ExternalCardTooltip {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.containerEl - 外部容器元素
   * @param {boolean} options.sanitize - 是否转义 HTML
   * @param {Function} options.onUpdate - 状态更新回调
   */
  constructor({ containerEl, sanitize = true, onUpdate = null }) {
    this.containerEl = containerEl;
    this.sanitize = sanitize;
    this.onUpdate = onUpdate;
    
    // 内部状态
    this._visible = false;
    this._isError = false;
    this._currentContent = { text: '', subtext: '' };
    
    // 创建内部 DOM 结构
    this._setupDOM();
  }
  
  /**
   * 创建内部 DOM 结构
   */
  _setupDOM() {
    // 清空容器
    this.containerEl.innerHTML = '';
    
    // 创建主文本元素
    this.textEl = document.createElement('div');
    this.textEl.className = 'leaflet-draw-hint-text';
    
    // 创建副文本元素
    this.subtextEl = document.createElement('div');
    this.subtextEl.className = 'leaflet-draw-hint-subtext';
    
    // 添加到容器
    this.containerEl.appendChild(this.textEl);
    this.containerEl.appendChild(this.subtextEl);
    
    // 初始隐藏
    this.containerEl.style.display = 'none';
  }
  
  /**
   * 更新内容（leaflet-draw 必需接口）
   * @param {Object} content
   * @param {string} content.text - 主文本
   * @param {string} content.subtext - 副文本
   */
  updateContent(content) {
    if (!this.containerEl) return this;
    
    const { text = '', subtext = '' } = content || {};
    
    // console.log('🔄 ExternalCardTooltip.updateContent 被调用:', { text, subtext, isEmpty: !text && !subtext });
    
    this._currentContent = { text, subtext };
    
    // 任一非空 → 显示
    if (text || subtext) {
      setContent(this.textEl, text, this.sanitize);
      setContent(this.subtextEl, subtext, this.sanitize);
      this._show();
      // console.log('👁️ Tooltip 显示');
    } else {
      // 两者都为空 → 隐藏
      this._hide();
      // console.log('🙈 Tooltip 隐藏');
    }
    
    this._notifyUpdate();
    return this;
  }
  
  /**
   * 更新位置（leaflet-draw 必需接口，但外部 tooltip 不使用）
   * @param {L.LatLng} latlng
   * @returns {this}
   */
  updatePosition(latlng) {
    // 外部提示栏不需要位置，但方法必须存在
    return this;
  }
  
  /**
   * 显示为错误态（leaflet-draw 必需接口）
   */
  showAsError() {
    if (!this.containerEl) return this;
    this._isError = true;
    this.containerEl.classList.add('is-error');
    this._notifyUpdate();
    return this;
  }
  
  /**
   * 移除错误态（leaflet-draw 必需接口）
   */
  removeError() {
    if (!this.containerEl) return this;
    this._isError = false;
    this.containerEl.classList.remove('is-error');
    this._notifyUpdate();
    return this;
  }
  
  /**
   * 销毁（leaflet-draw 必需接口）
   */
  dispose() {
    // console.log('⚠️ dispose() 被调用，清理资源');
    
    this._hide();
    this._currentContent = { text: '', subtext: '' };
    
    // 清空 DOM 内容但不删除元素（外部容器需要保留）
    if (this.textEl) this.textEl.textContent = '';
    if (this.subtextEl) this.subtextEl.textContent = '';
    
    this._notifyUpdate();
    
    // 注意：不删除 DOM 元素，只清空引用
    // DOM 元素（containerEl）是外部传入的，应该保留在页面上
    this.containerEl = null;
    this.textEl = null;
    this.subtextEl = null;
    this.onUpdate = null;
  }
  
  /**
   * 显示容器
   */
  _show() {
    // console.log('_show() 被调用, 当前状态:', {
    //   hasContainer: !!this.containerEl,
    //   _visible: this._visible,
    //   displayStyle: this.containerEl?.style.display
    // });
    
    if (!this.containerEl) {
      // console.error('⚠️ containerEl 不存在！');
      return;
    }
    
    if (this._visible) {
      // console.log('⚠️ _visible 已经是 true，跳过显示');
      return;
    }
    
    this._visible = true;
    this.containerEl.style.display = 'block';
    // console.log('✅ 已设置 display = block, _visible = true');
  }
  
  /**
   * 隐藏容器
   */
  _hide() {
    // console.log('_hide() 被调用, 当前状态:', {
    //   hasContainer: !!this.containerEl,
    //   _visible: this._visible,
    //   displayStyle: this.containerEl?.style.display
    // });
    
    if (!this.containerEl) {
      // console.error('⚠️ containerEl 不存在！');
      return;
    }
    
    if (!this._visible) {
      // console.log('⚠️ _visible 已经是 false，跳过隐藏');
      return;
    }
    
    this._visible = false;
    this.containerEl.style.display = 'none';
    this.removeError();
    // console.log('✅ 已设置 display = none, _visible = false');
  }
  /**
   * 通知上层状态变化
   */
  _notifyUpdate() {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(
        { ...this._currentContent },
        {
          visible: this._visible,
          isError: this._isError
        }
      );
    }
  }
}
