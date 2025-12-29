# Leaflet Draw External Tooltip

一个轻量级的 Leaflet.draw 插件，用于将绘制提示从地图内移动到外部自定义容器中。

## ✨ 特性

- 🎯 **无框架依赖** - 纯 JavaScript 实现，可在任何项目中使用
- 🔧 **易于集成** - 只需几行代码即可集成
- 🎨 **完全可定制** - 支持自定义样式和容器位置
- 🔒 **安全** - 内置 XSS 防护
- 📦 **轻量级** - 无额外依赖，构建后体积小
- 🌐 **TypeScript 友好** - 提供完整的类型定义（计划中）

## 📦 安装

```bash
npm install leaflet-draw-tooltips
```

或者直接使用 CDN：

```html
<script src="https://unpkg.com/leaflet-draw-tooltips/dist/leaflet-draw-tooltip.umd.cjs"></script>
```

## 🚀 快速开始

### 基础用法

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
  <style>
    #map { height: 500px; }
    #hint { 
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="hint" class="leaflet-draw-hint-container"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
  <script type="module">
    import { installLeafletDrawExternalTooltip } from 'leaflet-draw-tooltips';

    // 初始化地图
    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // 安装外部 tooltip（必须在创建 Draw Control 之前）
    const { tooltip } = installLeafletDrawExternalTooltip({
      map: map,
      el: '#hint'
    });

    // 创建绘制控件
    const drawControl = new L.Control.Draw({
      draw: {
        polyline: true,
        polygon: true,
        rectangle: true,
        circle: true,
        marker: true
      }
    });
    map.addControl(drawControl);

    // 处理绘制完成事件
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    map.on(L.Draw.Event.CREATED, function(e) {
      drawnItems.addLayer(e.layer);
      tooltip.updateContent({}); // 清空提示
    });
  </script>
</body>
</html>
```

## ⚠️ 重要：调用顺序

**必须在创建 `L.Control.Draw()` 之前调用 `installLeafletDrawExternalTooltip()`！**

```javascript
// ✅ 正确顺序
const { tooltip } = installLeafletDrawExternalTooltip({ ... });
const drawControl = new L.Control.Draw({ ... });

// ❌ 错误顺序（不会生效）
const drawControl = new L.Control.Draw({ ... });
const { tooltip } = installLeafletDrawExternalTooltip({ ... });
```

## 📖 API

### `installLeafletDrawExternalTooltip(options)`

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `map` | `L.Map` | ✅ | - | Leaflet 地图实例 |
| `el` | `HTMLElement \| string` | ✅ | - | 外部容器元素或选择器 |
| `hideMapTooltip` | `boolean` | ❌ | `true` | 是否隐藏地图内原生 tooltip |
| `sanitize` | `boolean` | ❌ | `true` | 是否转义 HTML，防止 XSS |
| `onUpdate` | `function` | ❌ | `null` | 状态更新回调 |

#### 返回值

```javascript
{
  cleanup: Function,  // 清理函数
  tooltip: ExternalCardTooltip  // Tooltip 实例
}
```

### Tooltip 方法

```javascript
const { tooltip } = installLeafletDrawExternalTooltip({ ... });

// 手动更新内容
tooltip.updateContent({ 
  text: '主要提示文本',
  subtext: '次要提示文本'
});

// 清空提示
tooltip.updateContent({});

// 显示错误状态
tooltip.showAsError();

// 移除错误状态
tooltip.removeError();
```

### 状态更新回调

```javascript
installLeafletDrawExternalTooltip({
  map: map,
  el: '#hint',
  onUpdate: (content, state) => {
    console.log('内容:', content.text, content.subtext);
    console.log('可见:', state.visible);
    console.log('错误:', state.isError);
  }
});
```

## 🎨 样式定制

插件会自动注入默认样式，但你可以覆盖这些 CSS 类：

```css
/* 容器 */
.leaflet-draw-hint-container {
  /* 自定义样式 */
}

/* 主文本 */
.leaflet-draw-hint-text {
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
}

/* 副文本 */
.leaflet-draw-hint-subtext {
  font-size: 14px;
  color: #666;
}

/* 错误状态 */
.leaflet-draw-hint-container.is-error {
  background: #ffe6e6;
  border-color: #ff4444;
}
```

## 🔧 开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/leaflet-draw-tooltips.git
cd leaflet-draw-tooltips

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 📝 注意事项

### 矩形绘制完成后需要手动清空提示

Leaflet.draw 的某些图形（如矩形）在绘制完成后不会自动清空 tooltip。需要在 `draw:created` 事件中手动清空：

```javascript
map.on(L.Draw.Event.CREATED, function(e) {
  drawnItems.addLayer(e.layer);
  tooltip.updateContent({}); // 重要：清空提示
});
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 支持

如有问题或建议，请提交 Issue 或通过邮件联系。
