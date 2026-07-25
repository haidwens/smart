# 🍎 Nexus Notes — macOS & Android PKM Knowledge Vault

> **Nexus Notes** 是一款遵循 **Clean Minimalism** 极简美学设计的高性能个人知识管理（PKM）与离线笔记系统。完美融合了 **OneNote 的多层笔记本架构** 与 **Obsidian 的双向链接 WikiLinks 知识图谱**，并集成了 **Gemini AI 智能助手**，支持 macOS 桌面版与 Android 移动端原生化部署。

---

## 🌟 核心特性 (Key Features)

### 1. 🍎 极致原生 macOS 交互体验
- **macOS Window Aesthetic**: 原生红黄绿三色控制按钮、高斯模糊毛玻璃侧边栏与精细的文字排版。
- **极简明亮/深色主题**: 适配 Apple 设计规范，支持一键切换 Mac Light 与 Mac Dark 模式。
- **100% 离线优先**: 所有数据默认存储于本地 IndexedDB/LocalStorage，无需依赖第三方云端，保障个人隐性知识安全。

### 2. 🧠 双重知识组织体系
- **OneNote 笔记本/分区架构**: 经典 Notebook -> Section -> Note 三级卡片分层管理，适合结构化课程与项目笔记。
- **Obsidian 文件夹与标签索引**: 树状文件夹层级 + 全局 `#tag` 聚合索引，适合碎片化卡片盒笔记法（Zettelkasten）。

### 3. 🔗 双向链接与知识图谱 (WikiLinks & Backlinks)
- **智能 WikiLink**: 键入 `[[` 自动触发笔记标题补全与新建引用。
- **交互式网络图谱 (Graph View)**: 基于 Canvas 的 2D 物理节点关系力导向图，清晰呈现笔记之间的连接网络。
- **反向链接与未链接提及**: 右侧 Inspector 面板自动识别反向链接（Backlinks）与潜在词汇提及，支持一键转化链接。
- **无限白板 (Canvas View)**: 可在无限画布上自由放置卡片、文本节点、连接线，进行灵感脑暴。

### 4. 🤖 Nexus Gemini AI 助手
- **全能文案引擎**: 基于 Google Gemini 2.5 Flash 模型，代理服务部署于服务器端，防密钥泄漏。
- **智能任务提取**: 一键从笔记内容中提炼待办事项 (`- [ ]`) 与行动清单。
- **自动链接推荐**: 智能分析当前笔记上下文，推荐适合关联的现有知识库笔记。
- **一键追加入库**: 生成的内容可直接无缝追加至当前笔记底部。

### 5. 📓 每日笔记与日历 (Daily Notes)
- 整合内置日历面板，方便进行每日思考复盘、Journaling 与 Habit Tracking。

---

## 📱 多平台部署与下载 package (Multi-Platform Deployment)

本项目内置完整的 Web、macOS 桌面端（Tauri / Electron 打包）与 Android 移动端（PWA / Capacitor APK）构建配置：

| 平台 (Platform) | 构建类型 (Format) | 说明 (Description) |
| :--- | :--- | :--- |
| **macOS Desktop** | `.dmg` / `.app` | 支持 M 系列 Apple Silicon 与 Intel 芯片，提供 Mac 原生窗口与快捷键支持 (⌘K, ⌘N, ⌘G)。 |
| **Android Mobile** | `.apk` / PWA | 适配手机与平板触摸屏，支持离线 PWA 安装与全屏沉浸模式。 |
| **Web / Cloud Run** | Cloud Run Container | 基于 Docker 容器一键部署，支持全栈 Express + Vite 高效服务。 |

> 💡 **提示**：可以在应用顶部右上角的 **“导出/多平台部署”** 按钮中，直接一键下载构建 macOS 原生应用安装包或 Android APK 离线包文件。

---

## 🛠️ 技术栈 (Tech Stack)

- **前端框架**: React 18, Vite, TypeScript
- **UI 样式**: Tailwind CSS (Clean Minimalism 视觉工程), Lucide Icons
- **动画引擎**: Motion (`motion/react`)
- **后端 Proxy & AI**: Node.js, Express, `@google/genai` (Gemini 2.5 Flash)
- **图形与白板**: Canvas API, HTML5 Drag & Drop
- **归档与压缩**: JSZip, FileSaver.js

---

## 💻 本地开发与构建 (Getting Started)

### 1. 克隆代码库
```bash
git clone https://github.com/your-username/nexus-notes.git
cd nexus-notes
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 并重命名为 `.env`，填入你的 Gemini API Key：
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. 启动开发服务器
```bash
npm run dev
```
访问 `http://localhost:3000` 即可在本地体验。

### 5. 构建生产包
```bash
npm run build
npm start
```

---

## ⌨️ 常用快捷键 (Shortcuts)

- <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> : 唤醒快速全局命令面板与搜索
- <kbd>⌘</kbd> + <kbd>N</kbd> / <kbd>Ctrl</kbd> + <kbd>N</kbd> : 快速新建笔记
- <kbd>⌘</kbd> + <kbd>G</kbd> / <kbd>Ctrl</kbd> + <kbd>G</kbd> : 切换知识关系图谱 (Graph View)
- <kbd>⌘</kbd> + <kbd>B</kbd> / <kbd>Ctrl</kbd> + <kbd>B</kbd> : 展开/折叠侧边栏
- <kbd>⌘</kbd> + <kbd>D</kbd> / <kbd>Ctrl</kbd> + <kbd>D</kbd> : 快速打开每日笔记日历

---

## 📄 开源许可 (License)

MIT License. Welcome to fork, star, and contribute!
