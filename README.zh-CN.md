# Leaflet Draw External Tooltip

[English](README.md) | 简体中文

一个轻量级的 Leaflet.draw 插件，用于将绘制提示从地图内移动到外部自定义容器中。

## ✨ 特性

- 🎯 **无框架依赖** - 纯 JavaScript 实现，可在任何项目中使用（Vue、React、Angular 或原生 JS）
- 🔧 **易于集成** - 只需几行代码即可集成
- 🎨 **完全可定制** - 支持自定义样式和容器位置
- 🔒 **安全** - 内置 XSS 防护
- 📦 **轻量级** - 无额外依赖，构建后体积小
- 🌐 **跨浏览器** - 支持所有现代浏览器

## 📦 安装

```bash
npm install leaflet-draw-tooltips
```

或者直接在 HTML 中使用：

```html
<script type="module">
  import { installLeafletDrawExternalTooltip } from './dist/leaflet-draw-tooltip.js';
</script>
```

## 🚀 快速开始

### 最小示例

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
</head>
<body>
  <div id="map" style="height: 500px;"></div>
  <div id="hint" class="leaflet-draw-hint-container"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
  <script type="module">
    import { installLeafletDrawExternalTooltip } from './src/index.js';

    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // 1️⃣ 安装外部 tooltip（必须在创建 Draw Control 之前）
    const { tooltip } = installLeafletDrawExternalTooltip({
      map: map,
      el: '#hint'
    });

    // 2️⃣ 创建绘制控件
    const drawControl = new L.Control.Draw({
      draw: { polyline: true, polygon: true, rectangle: true }
    });
    map.addControl(drawControl);

    // 3️⃣ 处理绘制完成
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

**必须先安装 tooltip，再创建 Draw Control！**

```javascript
// ✅ 正确
installLeafletDrawExternalTooltip({ ... });  // 先安装
new L.Control.Draw({ ... });                   // 后创建

// ❌ 错误（不会生效）
new L.Control.Draw({ ... });                   // 太早了
installLeafletDrawExternalTooltip({ ... });  // 太晚了
```

## 📖 完整文档

### API

#### `installLeafletDrawExternalTooltip(options)`

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `map` | `L.Map` | ✅ | - | Leaflet 地图实例 |
| `el` | `HTMLElement \| string` | ✅ | - | 容器元素或选择器（如 `'#hint'`） |
| `hideMapTooltip` | `boolean` | ❌ | `true` | 隐藏地图内原生 tooltip |
| `sanitize` | `boolean` | ❌ | `true` | HTML 转义（防 XSS） |
| `onUpdate` | `function` | ❌ | `null` | 状态更新回调 |

**返回值：**

```javascript
{
  cleanup: () => void,           // 清理函数
  tooltip: ExternalCardTooltip   // Tooltip 实例
}
```

### Tooltip 实例方法

```javascript
const { tooltip } = installLeafletDrawExternalTooltip({ ... });

// 更新内容
tooltip.updateContent({ 
  text: '主提示', 
  subtext: '副提示' 
});

// 清空（重要！绘制完成后调用）
tooltip.updateContent({});

// 错误状态
tooltip.showAsError();
tooltip.removeError();
```

### 状态回调

```javascript
installLeafletDrawExternalTooltip({
  map: map,
  el: '#hint',
  onUpdate: (content, state) => {
    console.log('文本:', content.text);
    console.log('可见:', state.visible);
    console.log('错误:', state.isError);
  }
});
```

## 🎨 样式定制

### 默认样式类

```css
.leaflet-draw-hint-container  /* 容器 */
.leaflet-draw-hint-text       /* 主文本 */
.leaflet-draw-hint-subtext    /* 副文本 */
.is-error                     /* 错误状态 */
```

### 自定义样式示例

```css
.leaflet-draw-hint-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
}

.leaflet-draw-hint-text {
  font-size: 18px;
  font-weight: bold;
}

.leaflet-draw-hint-subtext {
  font-size: 14px;
  opacity: 0.9;
}
```

## 🔧 在不同框架中使用

### Vue 3

```vue
<template>
  <div>
    <div id="map" style="height: 500px;"></div>
    <div ref="hintRef" class="leaflet-draw-hint-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { installLeafletDrawExternalTooltip } from 'leaflet-draw-tooltips';

const hintRef = ref(null);

onMounted(() => {
  const map = L.map('map').setView([51.505, -0.09], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  const { tooltip } = installLeafletDrawExternalTooltip({
    map,
    el: hintRef.value
  });

  const drawControl = new L.Control.Draw({ ... });
  map.addControl(drawControl);
  
  // ... 其他逻辑
});
</script>
```

### React

```jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { installLeafletDrawExternalTooltip } from 'leaflet-draw-tooltips';

function MapComponent() {
  const mapRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const { tooltip } = installLeafletDrawExternalTooltip({
      map,
      el: hintRef.current
    });

    const drawControl = new L.Control.Draw({ ... });
    map.addControl(drawControl);

    return () => map.remove();
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ height: '500px' }}></div>
      <div ref={hintRef} className="leaflet-draw-hint-container"></div>
    </div>
  );
}
```

## 📝 常见问题

### Q: 为什么提示不显示？

A: 确保在创建 `L.Control.Draw()` **之前**调用 `installLeafletDrawExternalTooltip()`。

### Q: 绘制完成后提示不消失？

A: 需要在 `draw:created` 事件中手动清空：

```javascript
map.on(L.Draw.Event.CREATED, function(e) {
  tooltip.updateContent({}); // 清空提示
});
```

### Q: 如何自定义提示内容？

A: 使用 `tooltip.updateContent()` 方法：

```javascript
tooltip.updateContent({
  text: '自定义主文本',
  subtext: '自定义副文本'
});
```

## 🧪 测试

项目包含两个测试页面：

- `test/index.html` - 完整功能演示
- `test/simple.html` - 最小示例

运行测试：

```bash
npm install
npm run dev
```

## 📄 许可证

MIT

## 🙏 致谢

- [Leaflet](https://leafletjs.com/)
- [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw)
