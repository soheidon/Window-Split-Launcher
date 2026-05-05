# Window Split Launcher

![Chrome](https://img.shields.io/badge/Chrome-MV3-blue)
![Version](https://img.shields.io/badge/version-0.1.0-lightgrey)

---

## 概要

ツールバーアイコンをワンクリックするだけで、現在のChromeウィンドウと任意のURLを左右に並べる軽量なChrome拡張です。ChatGPTやClaudeなどのAIチャットを論文やメールの横に開きたい、そんな用途を想定しています。

分割表示系の拡張は多機能である一方、タブや閲覧履歴、ページ内容へのアクセス権限を要求するものが少なくありません。本拡張は**ウィンドウのリサイズとURLを開くことだけ**に徹し、最小限の権限で動作します。ページ本文、閲覧履歴、DOMには一切アクセスしません。

## 機能

- **ワンクリック起動** — ツールバーアイコンを押すだけ
- **開くURLを自由に設定** — ChatGPT、Claude、Gmail、任意のURL
- **左右どちらでも** — 設定URLを左に開くか右に開くか選択可能
- **比率調整** — 現在ウィンドウ 50%〜75%、5%刻みのスライダー
- **隙間補正** — ウィンドウ枠や影による隙間を重ねて調整可能
- **マルチモニタ対応** — `system.display` APIでタスクバーやDockを避けて配置
- **プライバシー重視** — ページ内容・DOM・閲覧履歴にアクセスしない

## インストール

### リリース ZIP から

1. [Releases](https://github.com/soheidon/Window-Split-Launcher/releases) から最新の ZIP をダウンロード
2. ZIP を任意の場所に解凍
3. Chrome で `chrome://extensions` を開く
4. 右上の**デベロッパーモード**を ON
5. 「パッケージ化されていない拡張機能を読み込む」→ 解凍したフォルダを選択

### リポジトリから

1. このリポジトリをクローン
2. Chrome で `chrome://extensions` を開く
3. 右上の**デベロッパーモード**を ON
4. 「パッケージ化されていない拡張機能を読み込む」→ クローンしたルートフォルダを選択

## 使い方

1. Chromeツールバーの **Window Split Launcher** アイコンをクリック
2. 現在のウィンドウが片側にリサイズされる
3. 設定したURLが反対側の新しいウィンドウで開く

### 設定

アイコンを右クリック → **オプション** で設定画面を開きます。

| 設定項目 | 初期値 | 選択肢 |
|---------|--------|--------|
| Default URL | `https://chatgpt.com/` | 任意のURL |
| Open configured URL | Right | Left / Right |
| Layout ratio | 60:40 | 50:50〜75:25（5%刻みスライダー） |
| Window overlap | 8px | 0〜20px（スライダー） |

## 権限

| 権限 | 使用理由 |
|------|---------|
| `windows` | 現在のウィンドウのリサイズ、新規ウィンドウの作成と配置 |
| `storage` | 設定値（URL・位置・比率）の保存 |
| `system.display` | ディスプレイの作業領域を取得し、タスクバーを避けた配置を行うため |

使用していない権限: `tabs` `activeTab` `scripting` `host_permissions` `history` `contextMenus` `sidePanel`

## 動作の流れ

1. `chrome.windows.getLastFocused()` で現在のウィンドウを取得
2. 最大化・最小化・フルスクリーン状態なら `normal` に戻す
3. ウィンドウが属するディスプレイの作業領域（workArea）を取得
4. 設定された比率で左右の位置とサイズを計算
5. 現在のウィンドウをリサイズし、設定URLを新しいウィンドウで開く

## プロジェクト構成

```
manifest.json        — 拡張マニフェスト (Manifest V3)
background.js        — Service Worker（クリック時の処理）
options.html         — 設定ページ
options.js           — 設定ロジック
options.css          — 設定ページのスタイル
icons/               — アイコン (16, 32, 48, 128)
release/             — Chrome読み込み用（このフォルダを指定）
```

## 開発

```bash
# Chromeに読み込む
1. chrome://extensions を開く
2. デベロッパーモードをON
3. 「パッケージ化されていない拡張機能を読み込む」→ ルートフォルダを選択

# 変更を加えたあと
chrome://extensions で拡張カードの更新アイコンをクリック
```

## ライセンス

MIT

---

---

## What is this?

A lightweight Chrome extension that opens any configured URL side-by-side with your current window in one click. Ideal for putting ChatGPT, Claude, or any web app next to your current work.

Split-screen extensions often require broad permissions like reading your tabs, browsing history, or page content. **Window Split Launcher** does one thing only: resizes your current window and opens a URL next to it. It never accesses page content, DOM, or browsing history.

## Features

- **One-click launch** — Click the toolbar icon
- **Configurable URL** — ChatGPT, Claude, Gmail, or any URL
- **Left or right** — Choose which side the target URL opens on
- **Adjustable ratio** — Current window 50%–75% in 5% steps
- **Overlap compensation** — Adjust window overlap to hide gaps from borders and shadows
- **Multi-monitor aware** — Uses `system.display` API to avoid taskbars and docks
- **Privacy-first** — Never reads page content, DOM, or browsing history

## Installation

### From Release ZIP

1. Download the latest ZIP from [Releases](https://github.com/soheidon/Window-Split-Launcher/releases)
2. Unzip to any folder
3. Open `chrome://extensions` in Chrome
4. Enable **Developer mode** (top right toggle)
5. Click **Load unpacked** and select the unzipped folder

### From Repository

1. Clone this repository
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the cloned root folder

## Usage

1. Click the **Window Split Launcher** icon in the Chrome toolbar
2. Your current window resizes to one side
3. The configured URL opens in a new window on the other side

### Settings

Right-click the extension icon → **Options** to configure.

| Setting | Default | Options |
|---------|---------|---------|
| Default URL | `https://chatgpt.com/` | Any URL |
| Open configured URL | Right | Left / Right |
| Layout ratio | 60:40 | 50:50–75:25 (5% step slider) |
| Window overlap | 8px | 0–20px (slider) |

## Permissions

| Permission | Why |
|-----------|------|
| `windows` | Resize the current window and create a new one for the target URL |
| `storage` | Save your settings (URL, position, ratio) |
| `system.display` | Detect the display's work area to avoid the taskbar or dock |

Not used: `tabs` `activeTab` `scripting` `host_permissions` `history` `contextMenus` `sidePanel`

## How It Works

1. Gets your last focused window via `chrome.windows.getLastFocused()`
2. Restores to `normal` state if maximized, minimized, or fullscreen
3. Finds the display containing the window and gets its work area
4. Calculates positions based on your ratio setting
5. Resizes the current window and opens the target URL side by side

## Project Structure

```
manifest.json        — Extension manifest (Manifest V3)
background.js        — Service worker (click handler)
options.html         — Settings page
options.js           — Settings logic
options.css          — Settings page styles
icons/               — Extension icons (16, 32, 48, 128)
release/             — Loadable extension (point Chrome here)
```

## Development

```bash
# Load into Chrome
1. Open chrome://extensions
2. Enable Developer mode
3. Click "Load unpacked" → select the root folder

# After changes
Click the refresh icon on the extension card in chrome://extensions
```

## License

MIT

---

*Built with minimal permissions and maximum privacy in mind.*
