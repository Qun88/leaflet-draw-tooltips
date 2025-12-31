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
    // 如果容器中已有预期的元素，则重用它们（避免被其它实例清空）
    const existingText = this.containerEl.querySelector('.leaflet-draw-hint-text');
    const existingSubtext = this.containerEl.querySelector('.leaflet-draw-hint-subtext');

    if (existingText && existingSubtext) {
      this.textEl = existingText;
      this.subtextEl = existingSubtext;
    } else {
      // 创建主文本元素
      this.textEl = document.createElement('div');
      this.textEl.className = 'leaflet-draw-hint-text';

      // 创建副文本元素
      this.subtextEl = document.createElement('div');
      this.subtextEl.className = 'leaflet-draw-hint-subtext';

      // 如果容器为空或没有结构，则追加元素（但不盲目清空已有内容）
      this.containerEl.appendChild(this.textEl);
      this.containerEl.appendChild(this.subtextEl);
    }

    // 初始隐藏（如果尚未设置）
    if (!this.containerEl.style.display) {
      this.containerEl.style.display = 'none';
    }
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

    // 注意：不删除 DOM 元素，也不清空对 DOM 的引用。
    // containerEl 是外部传入的共享容器，保留引用以便其它实例或返回的 tooltip 继续可用。
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
