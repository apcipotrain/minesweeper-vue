# 💣 Minesweeper Master · 扫雷大师 (Vue 重构版)

## 🧭 项目简介

本项目是对原生 JS 版扫雷的深度重构与升级。基于 **Vue 3 (Composition API)** 构建，将原本松散的脚本转化为模块化、工程化的现代前端应用。在保留经典扫雷核心逻辑的基础上，引入了**章节闯关解锁系统**和**响应式自适应布局**，极大地提升了游戏的可玩性与视觉体验。

------

## 🎮 游戏功能

- **闯关模式**：
  - **逻辑残局**：从 JSON 预设数据加载特定的雷区布局，考验逻辑推理能力。
  - **励志寄语**：每关通关后显示专属圣经指点或励志文案。
- **经典模式**：
  - **高级标准**：16×30 布局，99 颗地雷。
  - **战绩统计**：实时记录胜率、最佳用时等数据。
- **核心操作**：
  - **左键**：挖开格子（首点避雷）。
  - **右键**：插旗标记。
  - **双键/长按**：双击已展开数字实现快速开区（Chord 操作）。

------

## 📦 运行与启动

### 普通玩家

**项目现已脱离 Python 本地服务器限制，点击下方链接即可通过浏览器直接游玩：**

> https://apcipotrain.github.io/minesweeper-vue/
>
> 建议使用 Chrome、Edge 或 Firefox 浏览器以获得最佳体验

------

### 开发学习者

如果你想查看源码、修改逻辑或进行本地调试，请按照以下步骤操作：

#### 1. 前置要求

确保你的电脑已安装 **[Node.js](https://nodejs.org/)** (建议版本 ≥ 18.0)。

#### 2. 安装与启动

1. **克隆项目/解压源码**： 进入项目根目录 `minesweeper-vue`。

2. **安装依赖库**： 在终端（CMD 或 PowerShell）执行以下命令，下载 Vue 和 Vite 等开发环境：

   Bash

   ```
   npm install
   ```

3. **启动开发服务器**：

   Bash

   ```
   npm run dev
   ```

4. **预览效果**： 访问终端输出的地址（通常为 `http://localhost:5173/`）。

#### 3. 进度清除

按下 `F12` 进入开发者工具 -> **Application (应用)** -> **Local Storage**：

- **删除 `ms_stats`**：即可删除经典模式的历史战绩记录。
- **修改 `ms_unlocked_id`**：即可改变闯关模式的进度。

​		⚠️ 注意：当前逻辑支持范围为 `1-24`。手动修改超出此范围的值可能会导致渲染异常，请谨慎尝试。

------

## 📂 目录结构与模块

```Plaintext
src/
├── assets/             # 静态样式资源
│   └── board.css       # 核心棋盘样式（控制 Cell 的 3D 效果、数字颜色等）
├── components/         # 公用组件
│   └── Cell.vue        # 最小单元格组件，处理点击事件与动态样式绑定
├── composables/        # 逻辑提取（Composition API）
│   └── useMinesweeper.js # 核心逻辑钩子：封装初始化、开区、插旗、胜负判定等算法
├── data/               # 数据层
│   ├── level.json      # 闯关模式配置：存储 24 个关卡的棋盘布局、残局文案
│   └── analysis.py     # 工具脚本：用于预处理或验证 JSON 数据的辅助工具
├── images/             # 游戏素材（背景图、装饰图）
├── views/              # 页面级组件（路由分发）
│   ├── ChallengeHome.vue # 章节选择页面（三章节入口）
│   ├── Chaptermap.vue    # 关卡选择地图（处理 1-8 关的解锁逻辑显示）
│   ├── ClassicGame.vue   # 经典模式入口（随机地图，高级扫雷规则）
│   └── GameStage.vue     # 核心游戏舞台：承载实际扫雷操作、倒计时与结算
├── App.vue             # 根组件：负责全局状态管理（如 gameMode）与各页面切换
├── main.js             # 项目入口：初始化 Vue 实例
└── style.css           # 全局基础样式
```

### 重点模块功能说明：

- **`useMinesweeper.js`**：这是项目的“大脑”。它将复杂的扫雷算法（如 Chord 连开、DFS 递归开区）从视图中剥离，确保了逻辑的纯粹性。
- **`Chaptermap.vue`**：负责进度的视觉体现。它通过计算属性对比 `maxUnlockedId`，决定每个关卡是处于“彩色可点击”还是“置灰锁定”状态。
- **`level.json`**：驱动“残局模式”的数据核心，定义了每一关真实的雷区分布，实现了“固定布局”的扫雷解谜体验。

------

## 🚀 重构核心变化

### 1. 工程化架构 (Vue 3 + Composables)

- **逻辑与视图分离**：利用 `Composables` (如 `useMinesweeper.js`) 封装核心逻辑，实现状态共享与逻辑复用。
- **组件化开发**：将界面拆分为 `Cell` (格子)、`ChapterMap` (地图)、`GameStage` (游戏舞台) 等独立组件，代码结构清晰，易于维护。

### 2. 新增：章节闯关解锁系统 (Progression System)

- **3×8 矩阵关卡**：游戏分为三个章节，共 24 个精心设计的逻辑关卡。
- **动态解锁逻辑**：
  - 引入 `maxUnlockedId` 全局进度管理。
  - 玩家必须通过当前关卡才能解锁下一关，进度通过 `localStorage` 实现**永久化存储**。
- **地图交互**：`ChapterMap` 组件根据解锁状态动态渲染（未解锁关卡呈现灰色锁定状态 🔒）。

### 3. 渲染与 UI 优化

- **响应式布局 (Flexbox)**：放弃了传统的 `line-height` 居中方案，改用 **Flex 布局**。无论屏幕尺寸如何变化，数字、地雷和旗帜始终保持绝对中心。
- **自适应格子 (Dynamic Sizing)**：根据关卡行列数自动计算 `cellSize`，确保大型地图在移动端和网页端都能完美适配。
- **动态样式绑定**：数字颜色、字体大小（随格子缩放）均通过 Vue 数据绑定实现，视觉表现更加精致。

------

## 🛠️ 技术栈

- **框架**：Vue 3 (SFC, Setup Syntax)
- **状态管理**：Reactive State / Composables
- **样式**：CSS3 (Flexbox, Backdrop-filter, CSS Variables)
- **存储**：LocalStorage (用于关卡进度与统计数据)
- **构建工具**：Vite

------

## 🎨 样式说明

项目使用 `board.css` 作为全局皮肤规范：

- **`.cell`**：基础格子，具备 3D 凸起效果。
- **`.cell.open`**：已打开格子，具备 3D 凹陷效果与 `data-num` 颜色映射。
- **`.locked`**：关卡锁定状态，具备灰度滤镜。

---

## 👨‍💻 关于作者

本项目用于前端学习与扫雷算法实践演示。

作者：@apcipot_rain

版本：v1.0 (2026.4.15)

该版本可改进空间包括但不限于：

1. 关卡更新、内容丰富
2. 增加设置棋盘与雷数功能

如果你觉得这个项目对你有帮助，欢迎关注我的动态：

* **CSDN**: [apcipot_rain-CSDN博客](https://blog.csdn.net/xinghuayu_lin?spm=1000.2115.3001.5343)
* **哔哩哔哩**: [【minesweeper扫雷】残局挑战关卡讲解_哔哩哔哩 bilibili_扫雷](https://www.bilibili.com/video/BV1BWzkB5EPi/?spm_id_from=333.1387.upload.video_card.click&vd_source=d7dc9e1808edc3c6c6ab787ea4b4bfa0)

* **GitHub**: [我的GitHub](https://github.com/apcipotrain)

**💡 欢迎交流、反馈 Bug 或提交 Pull Request！**

感谢您体验 **Minesweeper Master (Vue Edition)**！这不仅是一个经典游戏的复刻，更是一个现代前端工程化的实战演练。
