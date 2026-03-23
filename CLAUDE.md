# Battleship Project - CLAUDE.md

## Language
- 用廣東話同用戶溝通

## Auto Commit & Push
- 每次改完代碼後，自動 `git add` → `git commit` → `git push origin main`
- 唔使問用戶確認

## Project Structure
- `index.html` (~623 lines) - HTML 結構
- `app.js` (~5,989 lines) - 主要遊戲邏輯
- `style.css` (~3,293 lines) - 所有 CSS 樣式
- `firebase-init.js` (~291 lines) - Firebase 模組初始化 + 登入狀態監聽 + Session Tracking
- `vocab_data.js` - 詞彙數據

## Key Systems

### Race System (種族系統)
- **VANGUARDS** — 藍色主題 (`#0ea5e9`)
- **AURELIANS** — 金色主題 (`LightGoldenRodYellow` / `rgba(250, 227, 130, ...)`)
- 變量: `selectedRace`，用 CSS class 如 `.aurelians` 切換顏色

### Game Flow
- `startExperience()` — TAP TO START 後觸發
- `showMainMenu()` — 顯示主選單
- `switchScene('PLAYER' | 'ENEMY')` — 切換攻擊/防守場景
- `currentPhase` — 遊戲階段: `DEPLOY` → `PLAYER_TURN` / `ENEMY_TURN` → `GAME_OVER`
- `switchHudPanel(panelId)` — 切換 HUD 面板 (login-panel, connecting-panel, user-profile-panel)

### Session Tracking (防重複登入)
- 喺 `firebase-init.js` 用 `deviceId` + Firebase `activeSession` 監聽
- 被踢時用遊戲內 `showNotification()` 通知，唔用原生 `alert()`
- 被踢後透過 `localStorage.setItem('battleship_kicked', '1')` 記住狀態，reload 後喺 login panel 顯示通知

### Notification System
- `showNotification(text, type, duration)` — 遊戲內通知彈窗
- `type`: `'success'` (綠色) 或 `'error'` (紅色)
- `duration`: 毫秒，預設 3000

### Instruction Container
- 棋盤下方顯示操作指引
- 只喺 `PLAYER_TURN` 顯示，攻擊開始 (`isTargeting`) 時隱藏
- 有 `play-expand` class 觸發 scaleX 展開動畫
- 跟種族顏色：Vanguards 藍 / Aurelians 金

## CSS Conventions
- CSS 變量: `--primary: #0ea5e9`, `--danger: #ef4444`, `--success: #22c55e`
- 棋盤: `border-radius: 12px`
- 動畫兼容性: 用 `scaleX`/`transform` 而非 `clip-path`（Safari 兼容）
- 觸發動畫用 class toggle + `void offsetWidth` reflow，唔用 `style.animation` 直接設值
