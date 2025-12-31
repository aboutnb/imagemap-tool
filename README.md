# ImageMap Editor

一个简洁现代的 HTML 图像热区编辑器，可视化创建交互式图像映射并生成标准 HTML 代码。

## 功能特性

- 🖼️ **图片上传** - 支持拖拽或点击上传图片
- 📐 **矩形区域** - 拖拽绘制矩形热区
- ⭕ **圆形区域** - 拖拽绘制圆形热区
- 🔷 **多边形区域** - 点击添加顶点，创建任意形状
- 👁️ **实时预览** - 切换编辑/预览模式，测试热区效果
- 📋 **代码生成** - 自动生成标准 HTML image map 代码
- 🌓 **主题切换** - 支持浅色/深色主题

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 使用方法

### 1. 上传图片
点击 **Upload Image** 按钮或点击画布区域上传图片。

### 2. 选择绘制工具

| 工具 | 说明 |
|------|------|
| **Rectangle** | 拖拽绘制矩形区域 |
| **Circle** | 拖拽绘制圆形区域（从圆心向外拖动） |
| **Polygon** | 点击添加顶点，双击或点击起点完成 |

### 3. 绘制多边形
1. 选择 **Polygon** 工具
2. 在图片上点击添加顶点（至少 3 个）
3. 完成方式：
   - 点击第一个点（绿色）闭合
   - 双击完成
   - 按 `Enter` 键完成
4. 按 `Escape` 取消当前绘制

### 4. 编辑区域属性
- **单击** 区域选中
- **双击** 区域打开属性编辑器
- 可设置：链接地址、Alt 文本、鼠标提示

### 5. 预览与导出
- 点击 **Preview** 切换到预览模式，测试热区交互
- 在右侧面板复制生成的 HTML 代码

## 生成代码示例

```html
<img src="image.jpg" alt="Image Map" usemap="#imagemap" />
<map name="imagemap">
  <area shape="rect" coords="10,20,100,80" href="https://example.com" alt="链接1" title="提示文字" />
  <area shape="circle" coords="150,100,50" href="#" alt="链接2" title="" />
  <area shape="poly" coords="200,50,250,100,200,150,150,100" href="#" alt="多边形" title="" />
</map>
```

## 技术栈

- React 19
- TypeScript
- Tailwind CSS
- Vite

## 许可证

MIT
