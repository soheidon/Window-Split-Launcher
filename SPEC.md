# Window Split Launcher 仕様書 / Specification

---

## 1. 概要

本拡張機能は、Chromeのツールバーアイコンをクリックするだけで、現在のChromeウィンドウと任意のURLを左右に並べる軽量ランチャーである。

Chrome標準のSplit Viewを直接操作するのではなく、**2つのChromeウィンドウを左右に配置する方式**を採用する。

本拡張は、ページ本文、閲覧履歴、DOM、入力内容を読まない。
行う処理は、現在ウィンドウのリサイズと、設定URLを開いた新規ウィンドウの配置のみである。

## 2. 基本方針

- ツールバーアイコンからワンクリックで起動する
- 現在のChromeウィンドウを左右どちらかに配置する
- 設定した任意URLを反対側の新規Chromeウィンドウで開く
- 開くURLは設定で変更できる
- 設定URLを右に出すか左に出すかを設定できる
- 左右比率を設定できる
- Chrome標準Split Viewは操作しない
- iframe埋め込みは行わない
- ページ本文を読まない
- DOMにアクセスしない
- 閲覧履歴を読まない
- APIキーを扱わない
- 外部サーバーへ独自通信しない

## 3. Chrome権限

```json
{
  "permissions": [
    "windows",
    "storage",
    "system.display"
  ]
}
```

### 使用する権限

| 権限 | 用途 |
|------|------|
| `windows` | 最後にフォーカスされていたウィンドウの取得、現在ウィンドウの位置・サイズ変更、任意URLウィンドウの新規作成 |
| `storage` | 設定値（起動URL、左右比率、表示位置）の保存と読み込み |
| `system.display` | ディスプレイの作業領域（workArea）を取得し、タスクバーやDockを避けた配置、マルチモニタ時の配置安定化 |

### 使用しない権限

`tabs` `activeTab` `scripting` `host_permissions` `history` `contextMenus` `sidePanel`

## 4. 想定する使い方

ユーザーが任意のWebページを開いた状態で、ツールバーアイコンを押す。

```
Before:
┌────────────────────────────┐
│ 現在のChromeウィンドウ        │
│ Webページ / 論文 / メール等    │
└────────────────────────────┘

After:
┌──────────────────────┬──────────────────────┐
│ 現在のChromeウィンドウ │ 設定URLのウィンドウ    │
│ Webページ             │ 任意URL               │
└──────────────────────┴──────────────────────┘
```

設定により、任意URLを左側に出すこともできる。

## 5. 対象URL

初期値は `https://chatgpt.com/`

想定される利用例：

- `https://chatgpt.com/`
- `https://claude.ai/`
- `https://gemini.google.com/`
- `https://chat.deepseek.com/`
- `https://openrouter.ai/chat`
- `https://www.perplexity.ai/`
- `https://mail.yahoo.co.jp/`
- `https://docs.google.com/`

## 6. 基本機能

### 6.1 ツールバー起動

Chromeツールバーの拡張機能アイコンをクリックすると、次を実行する。

1. 最後にフォーカスされていたChromeウィンドウを取得する
2. ウィンドウが maximized / minimized / fullscreen の場合は normal に戻す
3. normal 化後にウィンドウ情報を再取得する
4. そのウィンドウが属するディスプレイの作業領域を取得する
5. 設定に応じて、現在ウィンドウを左側または右側に配置・リサイズする
6. 設定URLを反対側の新規Chromeウィンドウで開く

Service Workerでは `chrome.windows.getCurrent()` を使わず、`chrome.windows.getLastFocused()` を使う。

## 7. URLを出す位置

- 設定URLを右側に開く（初期値）
- 設定URLを左側に開く

## 8. 左右比率

比率は、**現在ウィンドウ側の幅比率**として定義する。初期値は `60:40`（現在ウィンドウ:設定URLウィンドウ）。

設定UIではスライダーで 50%〜75%（5%刻み）の範囲で調整可能。値は `mainRatio` として 0.5〜0.75 の少数で保存される。

## 9. 最小ウィンドウ幅

ChromeやOSにはウィンドウの最小幅制約がある。

| 定数 | 値 |
|------|-----|
| minWindowWidth | 420px |
| minWindowHeight | 400px |

計算結果が最小幅を下回る場合：

- 可能なら 50:50 に近づける
- それでも不足する場合は target window を最小幅にする
- 現在ウィンドウも最小幅を下回る場合は、配置を中止する

## 10. ウィンドウ間の隙間対策

WindowsやChromeのウィンドウ装飾、影、リサイズ境界により、左右のウィンドウ間に数px程度の隙間が見えることがある。
これを補正するため、左右のウィンドウをわずかに重ねる `overlapPx` 設定を持たせる。

| 項目 | 値 |
|------|-----|
| 設定キー | `overlapPx` |
| 初期値 | 8px |
| 調整範囲 | 0〜20px |

- 設定URLを右に開く場合：targetWindow の left を overlapPx 分だけ左に寄せ、width を overlapPx 分だけ広げる
- 設定URLを左に開く場合：currentWindow の left を overlapPx 分だけ左に寄せ、width を overlapPx 分だけ広げる

## 11. URLの扱い

初期実装では、常に設定されたデフォルトURLを開く。

第2段階で「常にデフォルトURLを開く / 前回開いたURLを保持して開く」を設定可能にする。

## 12. 既存ウィンドウ再利用

初期実装では、設定URLウィンドウを常に新規作成する。

第2段階で以下を検討する：

1. 前回作成した対象ウィンドウIDを保存する
2. `chrome.windows.get(lastTargetWindowId)` で存在確認する
3. 存在すれば、そのウィンドウを再利用する
4. 再利用時は `chrome.windows.update(id, { focused: true })` で前面に出す
5. 存在しなければ新規作成する

> 注意: `lastTargetWindowId` はブラウザ再起動後に無効になる可能性があるため、必ず `chrome.windows.get` で存在確認する。

## 13. 設定画面

### 初期実装の設定項目

| 項目 | 種類 | 値 |
|------|------|----|
| Default URL | テキスト入力 | 任意URL（初期値: `https://chatgpt.com/`） |
| Open configured URL | ラジオボタン | Left / Right（初期値: Right） |
| Layout ratio | スライダー | 50:50〜75:25（5%刻み、初期値: 60:40） |

### 第2段階で追加する設定

- URL behavior: Always open default URL / Open last used URL
- Reuse existing target window
- Keyboard shortcut

## 14. マルチモニタ対応

`chrome.system.display.getInfo()` を使用する。

1. 現在ウィンドウの中心点を計算する
2. その中心点が含まれるディスプレイを探す
3. 該当ディスプレイの workArea を取得する
4. workArea を左右分割の基準領域とする

該当ディスプレイが見つからない場合は、現在ウィンドウの矩形を基準にする。

## 15. ウィンドウ配置ロジック

### 設定URLを右側に開く場合

```
currentWindow:
  left = baseLeft
  top = baseTop
  width = baseWidth * mainRatio
  height = baseHeight

targetWindow:
  left = baseLeft + currentWindowWidth
  top = baseTop
  width = baseWidth - currentWindowWidth
  height = baseHeight
```

### 設定URLを左側に開く場合

```
targetWindow:
  left = baseLeft
  top = baseTop
  width = baseWidth * (1 - mainRatio)
  height = baseHeight

currentWindow:
  left = baseLeft + targetWindowWidth
  top = baseTop
  width = baseWidth - targetWindowWidth
  height = baseHeight
```

## 16. 保存データ構造

```json
{
  "defaultUrl": "https://chatgpt.com/",
  "targetPosition": "right",
  "mainRatio": 0.6
}
```

## 17. セキュリティ方針

- Webページ本文を読まない
- 設定URL先のページ内容を読まない
- DOMにアクセスしない
- content scriptを注入しない
- 閲覧履歴を読まない
- APIキーを扱わない
- 外部サーバーへ独自通信しない

拡張が行うのは、ウィンドウの位置・サイズ変更と指定URLのオープンのみである。

## 18. 既製拡張との違い

既製のSplit Screen系拡張は多機能である一方、閲覧履歴、ページ操作、ホスト権限などを要求する場合がある。

本拡張は以下を重視する：

- 最小限に近い権限
- 任意ページを操作しない
- 閲覧履歴を読まない
- 単機能
- 任意URLを左右どちらかに開くことだけに集中する

## 19. ロードマップ

### 初期実装（v0.1.0）

- ツールバーアイコンで起動
- 最後にフォーカスされていたウィンドウを対象にする
- 現在ウィンドウをnormal化
- ディスプレイworkAreaに基づいて配置
- 任意URLを反対側の新規ウィンドウで開く
- デフォルトURL設定
- URLを左に開く / 右に開く設定
- 左右比率設定
- 設定保存

### 第2段階で検討

- 前回URLを開く
- 複数URLプリセット
- 既存対象ウィンドウ再利用
- キーボードショートカット
- ポップアップメニュー

## 20. ファイル構成

```
window-split-launcher/
  manifest.json
  background.js
  options.html
  options.js
  options.css
  icons/
    icon16.png
    icon32.png
    icon48.png
    icon128.png
```

---

---

## 1. Overview

A lightweight Chrome extension that opens any configured URL side-by-side with the current Chrome window in one click, via the toolbar icon.

Rather than manipulating Chrome's native Split View, it uses **two separate Chrome windows positioned side by side**.

This extension does not read page content, browsing history, DOM, or user input.
It only resizes the current window and opens a configured URL in a new window.

## 2. Design Principles

- One-click launch from the toolbar icon
- Position the current Chrome window on one side
- Open the configured URL in a new Chrome window on the opposite side
- The URL is user-configurable
- Choose whether the configured URL opens on the left or right
- Configurable split ratio
- No Split View manipulation
- No iframe embedding
- No page content access
- No DOM access
- No browsing history access
- No API keys
- No external server communication

## 3. Chrome Permissions

```json
{
  "permissions": [
    "windows",
    "storage",
    "system.display"
  ]
}
```

### Permissions Used

| Permission | Purpose |
|------------|---------|
| `windows` | Get the last focused window, resize/reposition the current window, create new windows |
| `storage` | Save and load settings (URL, position, ratio) |
| `system.display` | Get the display work area to avoid taskbars/docks; stable multi-monitor placement |

### Permissions NOT Used

`tabs` `activeTab` `scripting` `host_permissions` `history` `contextMenus` `sidePanel`

## 4. Intended Usage

The user opens any web page, then clicks the toolbar icon.

```
Before:
┌────────────────────────────┐
│ Current Chrome window      │
│ Web page / paper / email   │
└────────────────────────────┘

After:
┌──────────────────────┬──────────────────────┐
│ Current Chrome window│ Configured URL window │
│ Web page             │ Any URL              │
└──────────────────────┴──────────────────────┘
```

The configured URL can also be placed on the left via settings.

## 5. Target URL

Default: `https://chatgpt.com/`

Example URLs:

- `https://chatgpt.com/`
- `https://claude.ai/`
- `https://gemini.google.com/`
- `https://chat.deepseek.com/`
- `https://openrouter.ai/chat`
- `https://www.perplexity.ai/`
- `https://docs.google.com/`

## 6. Core Functionality

### 6.1 Toolbar Launch

Clicking the extension icon in the Chrome toolbar executes:

1. Get the last focused Chrome window
2. If the window is maximized / minimized / fullscreen, restore to normal
3. Re-fetch window info after normalization
4. Get the work area of the display containing the window
5. Resize and position the current window on the configured side
6. Open the configured URL in a new window on the opposite side

The service worker uses `chrome.windows.getLastFocused()`, not `chrome.windows.getCurrent()`.

## 7. Target URL Position

- Open configured URL on the right (default)
- Open configured URL on the left

## 8. Split Ratio

The ratio represents the **current window's width proportion**. Default is `60:40` (current : target).

The settings UI provides a slider adjustable from 50% to 75% in 5% increments. The value is stored as `mainRatio` (0.5–0.75).

## 9. Minimum Window Size

Chrome and the OS enforce minimum window dimensions. If calculated sizes are too small, Chrome may ignore the specified dimensions.

| Constant | Value |
|----------|-------|
| minWindowWidth | 420px |
| minWindowHeight | 400px |

When sizes fall below the minimum:

- Adjust toward 50:50 if possible
- If still insufficient, set the target window to the minimum width
- If the current window also falls below the minimum, abort and show an error

## 10. Window Overlap Compensation

Windows and Chrome window decorations, shadows, and resize borders can leave a visible gap of several pixels between the two windows. The `overlapPx` setting compensates by slightly overlapping the windows.

| Item | Value |
|------|-------|
| Setting key | `overlapPx` |
| Default | 8px |
| Range | 0–20px |

- Target URL on the right: the target window's `left` is shifted left by `overlapPx`, and its `width` is increased by `overlapPx`
- Target URL on the left: the current window's `left` is shifted left by `overlapPx`, and its `width` is increased by `overlapPx`

## 11. URL Behavior

The initial implementation always opens the configured default URL.

Phase 2 will add: "Always open default URL" vs "Open last used URL".

## 12. Target Window Reuse

The initial implementation always creates a new window for the target URL.

Phase 2 will consider:

1. Save the last created target window ID
2. Check existence via `chrome.windows.get(lastTargetWindowId)`
3. Reuse the window if it exists
4. Bring it to the front via `chrome.windows.update(id, { focused: true })`
5. Create a new window if the saved ID is invalid

> Note: `lastTargetWindowId` may become invalid after a browser restart. Always verify with `chrome.windows.get`.

## 13. Settings Page

### Initial Implementation

| Setting | Type | Value |
|---------|------|-------|
| Default URL | Text input | Any URL (default: `https://chatgpt.com/`) |
| Open configured URL | Radio | Left / Right (default: Right) |
| Layout ratio | Slider | 50:50–75:25 in 5% steps (default: 60:40) |

### Phase 2 Additions

- URL behavior: Always open default URL / Open last used URL
- Reuse existing target window
- Keyboard shortcut

## 14. Multi-Monitor Support

Uses `chrome.system.display.getInfo()`:

1. Calculate the center point of the current window
2. Find the display containing that center point
3. Use that display's `workArea` for layout
4. Fall back to the current window's bounds if no matching display is found

## 15. Window Layout Logic

### Target URL on the Right

```
currentWindow:
  left = baseLeft
  top = baseTop
  width = baseWidth * mainRatio
  height = baseHeight

targetWindow:
  left = baseLeft + currentWindowWidth
  top = baseTop
  width = baseWidth - currentWindowWidth
  height = baseHeight
```

### Target URL on the Left

```
targetWindow:
  left = baseLeft
  top = baseTop
  width = baseWidth * (1 - mainRatio)
  height = baseHeight

currentWindow:
  left = baseLeft + targetWindowWidth
  top = baseTop
  width = baseWidth - targetWindowWidth
  height = baseHeight
```

## 16. Storage Data Structure

```json
{
  "defaultUrl": "https://chatgpt.com/",
  "targetPosition": "right",
  "mainRatio": 0.6
}
```

## 17. Security Policy

- Never reads web page content
- Never reads the target URL's page content
- No DOM access
- No content script injection
- No browsing history access
- No API keys
- No external server communication

The extension only resizes/repositions windows and opens URLs.

## 18. Differences from Existing Extensions

Existing split-screen extensions are often feature-rich but may require history, page manipulation, or host permissions.

This extension prioritizes:

- Minimal permissions
- No page manipulation
- No history access
- Single-purpose design
- Focused solely on opening any URL side by side

## 19. Roadmap

### Initial Release (v0.1.0)

- Toolbar icon launch
- Targets the last focused window
- Restores non-normal window states
- Display workArea-based placement
- Opens configured URL in a new window
- Configurable default URL
- Left/right target position setting
- Adjustable split ratio
- Settings persistence

### Phase 2 Candidates

- Open last used URL
- Multiple URL presets
- Reuse existing target window
- Keyboard shortcut
- Popup menu

## 20. File Structure

```
window-split-launcher/
  manifest.json
  background.js
  options.html
  options.js
  options.css
  icons/
    icon16.png
    icon32.png
    icon48.png
    icon128.png
```
