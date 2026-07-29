# Web UI 自动化测试框架 (Next.js 纯前端版)

这是一个完全基于纯前端技术（Next.js + 原生 JavaScript + Tailwind CSS）构建的浏览器 UI 自动化测试框架。它无需任何后端服务，通过 Next.js 的静态导出（Static Export）特性，直接生成静态 HTML 并在浏览器中运行，极易部署到 GitHub Pages 等静态服务。

## 🌟 核心特性
- **Next.js 架构**：功能文件模块化拆分，利用 React/Zustand 实现现代化的开发与状态管理。
- **零依赖后端运行**：完全在前端运行，数据天然隔离存储在浏览器 `LocalStorage` 中。
- **可视化编排**：无需手写代码，拖拽与表单化配置测试步骤。
- **沙箱隔离**：利用 `iframe` 承载待测页面，模拟真实交互。
- **本地化存储**：测试用例、报告与配置全量保存在浏览器 `LocalStorage` 中。
- **全方位断言与日志**：支持丰富的验证方式，运行日志实时打印，失败自动截图。

## 🚀 本地开发与启动
1. 安装依赖: `npm install`
2. 启动开发服务器: `npm run dev`
3. 浏览器打开 `http://localhost:3000`

## 🌐 GitHub Pages 部署步骤

### 1. 静态导出构建
由于该项目配置了 Next.js 的 `output: 'export'`，只需执行打包命令即可生成静态文件：
```bash
npm run build
```
打包后生成的 `out/` 文件夹内即为所有静态文件。

### 2. 部署到 GitHub Pages
1. 在 GitHub 上新建一个仓库。
2. 将 `out/` 目录下的所有文件上传至该仓库，或使用 GitHub Actions 自动构建部署。
3. 如果手动上传，在仓库 "Settings" -> "Pages" 中选择 `main` 分支作为 Source 并保存。
4. 部署完成后，链接分享给任何人均可直接访问编写自动化脚本。所有人的测试用例数据均隔离存储在其个人的浏览器中，互不影响。
