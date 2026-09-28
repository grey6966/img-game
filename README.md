# 图片拼图游戏（Vue 3）

纯前端图片拼图游戏，无需后端服务。上传本地图片后按 3×3 / 4×4 / 5×5 切分拼图块，支持点击交换与拖动交换，计时计步，完成后弹出成绩。

## 功能

- 本地图片上传（点击选择 / 拖拽到页面），自动居中裁切为正方形
- 难度可选 3×3、4×4、5×5，切换难度自动重新分割开局
- 拼图块随机打乱（保证开局不是已完成状态）
- 两种操作方式：点击两块交换；按住拖动一块到目标位置交换
- 实时计时、计步，完成后弹窗展示用时与步数
- 重新开始 / 重新上传 / 切换难度
- 响应式布局，适配手机和电脑（Pointer Events 统一触屏与鼠标）

## 技术栈

- Vue 3（Composition API，`<script setup>`）
- Vite
- Canvas 裁切图片、CSS background 定位渲染拼图块

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 http://localhost:5173 ）。手机调试可用同一局域网下的 Network 地址。

## 构建

```bash
npm run build
npm run preview
```

## 组件结构

```
src/
├── App.vue                        # 页面与游戏状态管理（计时、打乱、完成判定）
├── components/
│   ├── ImageUploader.vue          # 图片上传（点击 / 拖拽）
│   ├── DifficultySelector.vue     # 3×3 / 4×4 / 5×5 难度切换
│   ├── StatsBar.vue               # 计时与步数
│   ├── PuzzleBoard.vue            # 拼图棋盘（点击交换 / 拖动交换）
│   └── WinModal.vue               # 完成弹窗
├── main.js
└── styles.css
```
