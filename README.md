# 图片拼图游戏（Vue 3）

纯前端图片拼图游戏，无需后端服务。所有进度与纪录都保存在浏览器 localStorage 中。

## 功能

- **单页即玩**：打开就是游戏界面，上传图片后原地开始，不跳转页面
- **图片编辑**：上传后可在正方形裁剪框内拖动平移、滚轮/按钮缩放、旋转 90°；大图自动压缩为 720×720 JPEG，避免卡顿
- 难度可选 3×3、4×4、5×5，切换难度自动重新分割开局
- 拼图块随机打乱（保证开局不是已完成状态）
- 两种操作方式：点击两块交换；按住拖动一块到目标位置交换
- **参考图缩略图**：固定在右上角，单击放大查看，长按（触屏按住）临时查看
- **提示**：每局限 3 次，高亮错位格与其正确块所在位置，每次加 10 秒用时惩罚
- **撤销 / 重做**：记录每次交换，最多 300 步，误操作可回退
- **暂停**：暂停时遮罩拼图并停止计时；刷新页面后默认处于暂停状态，防止偷跑
- **自动存档**：图片、难度、块顺序、步数、用时、撤销历史均存入 localStorage，刷新可继续；完成后自动清除活动存档
- **完成效果**：拼图合拢去除间隙、撒花动画、WebAudio 合成音效、成绩弹窗
- **最佳纪录**：按 3×3 / 4×4 / 5×5 分别保存最佳用时与最少步数，破纪录时弹窗与状态栏提示
- 响应式布局，适配手机和电脑（Pointer Events 统一触屏与鼠标）

## 技术栈

- Vue 3（Composition API，`<script setup>`）
- Vite
- Canvas 裁剪/压缩图片、CSS background 定位渲染拼图块
- localStorage 存档与纪录（`puzzle-save-v1` / `puzzle-records-v1`）
- WebAudio API 合成音效（无音频资源文件）

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
├── App.vue                        # 页面与游戏状态管理（计时、交换、暂停、提示、存档）
├── components/
│   ├── ImageUploader.vue          # 图片上传（点击 / 拖拽）
│   ├── ImageEditor.vue            # 裁剪 / 缩放 / 旋转编辑器
│   ├── ReferenceThumb.vue         # 右上角参考图缩略图（点击放大 / 长按查看）
│   ├── DifficultySelector.vue     # 3×3 / 4×4 / 5×5 难度切换
│   ├── StatsBar.vue               # 计时、步数与当前难度最佳纪录
│   ├── PuzzleBoard.vue            # 拼图棋盘（点击/拖动交换、提示高亮、暂停遮罩、合拢）
│   ├── WinModal.vue               # 完成弹窗（含破纪录提示）
│   └── Confetti.vue               # 完成撒花
├── lib/
│   ├── storage.js                 # localStorage 存档与最佳纪录
│   └── sound.js                   # WebAudio 音效
├── main.js
└── styles.css
```
