# CLAUDE.md - todrive-gas

## プロジェクト概要
GmailのメールをGoogle Driveに整理保存するiPhone PWA。
Google Apps Script（GAS）で実装。APIキー不要・無料で動作。

## 技術スタック
- Google Apps Script（サーバーレス）
- HTML / CSS / JavaScript（Vanilla）
- Font Awesome 6（CDN）

## 主要ファイル
| ファイル | 説明 |
|---|---|
| `Code.gs` | GASバックエンド（メール取得・Drive保存・クイック保存） |
| `Index.html` | フロントエンドUI（モバイル: Gmail風 / デスクトップ: 2カラム） |

## 機能
- `ToDrive` ラベル付きメールを一覧表示
- メール本文を `.md` 形式で Drive に保存（DocumentApp不使用）
- 処理指示メモ（`.md`）も同フォルダに保存
- 添付ファイルも同フォルダに保存
- 処理済みメールに `Processed` ラベルを付与しアーカイブ
- ⚡ クイック保存（メモなし即時保存）
- 保存先：`_ToDrive/` フォルダ配下に自動整理
- PWA対応（ホーム画面追加・スタンドアロン動作）
- デスクトップ：左右2カラムUI / モバイル：Gmail風リスト + スライドイン詳細

## GAS特有の制約と対処法（重要）

### CSSメディアクエリが効かない問題
- **原因**：GASのHtmlService IFRAME sandboxモードでは、`@media (max-width)` が正しく動作しない
- **対処**：`navigator.userAgent` でモバイル判定し、`html` 要素に `.is-mobile` クラスを付与
- **適用**：CSSは `.is-mobile .xxx { ... }` 形式で記述

### モバイルでpx単位が小さくなる問題
- **原因**：GASのiframe内でページが約980px幅でレンダリングされ、ブラウザが縮小表示する
- **対処**：モバイル要素のサイズを全て `vw` 単位で指定（px禁止）
- **計算式**：`目標px ÷ 390(iPhone標準幅) × 100 = vw値`
  - 例: 17px → `4.4vw`, 14px → `3.6vw`, 44px → `11.3vw`
- **JSヘルパー**：`vs(px)` 関数 → isMobile時に自動でvw変換

```javascript
function vs(px) {
  return isMobile ? (px / 390 * 100).toFixed(1) + 'vw' : px + 'px';
}
```

- **適用範囲**：list行・ヘッダー・詳細ビュー・ローディング・モーダル・トーストすべて
- JSで動的生成するHTML内のinline styleにも `vs()` を使うこと

### GASデプロイフロー
コードを保存するだけでは `/exec` URLは更新されない。必ず：
1. GASエディタ → 右上「デプロイ」→「デプロイを管理」
2. 鉛筆アイコン → バージョン「新しいバージョン」→「デプロイ」

## CSSアーキテクチャ

### クラス命名規則
| プレフィックス | 対象 |
|---|---|
| `mr-*` | モバイルリスト行（mail-row）の子要素 |
| `dv-*` | 詳細ビュー（detailView）の要素 |
| `hd-*` | ヘッダー要素 |
| `fm-*` | フォルダモーダル要素 |
| `mob-ab` | モバイルアクションバー |
| `ld-*` | ローディングオーバーレイ |

### inline styleを追加する際のルール
- HTMLのinline styleは `.is-mobile` セクションでCSS上書きできるよう **クラス名を必ず付与**すること
- GASのiframeでは `!important` が必要な場合が多い

## 2026-02-24 作業記録
- Code.gs: メール取得・詳細・Drive保存を実装
  - `DocumentApp` を廃止し `folder.createFile()` で `.md` 直接生成
  - ルートフォルダ汚染バグを修正（`removeFile` 追加）
  - `window.prompt()` をカスタムモーダルに置き換え（iOS Safari対応）
  - ローディングUIを追加

## 2026-02-25 作業記録
- Code.gs: `doGet(e)` にPWA manifest route追加、`getTodriveBaseFolder()` 追加、`quickSaveToDrive()` 追加
- Index.html: モバイルUI全面刷新
  - GAS iframeのviewport問題を発見・解決（`@media` → `.is-mobile` クラス方式）
  - 全サイズを `px` → `vw` 単位に変更
  - Gmail iOSアプリ風リストデザイン（アバター・3行階層）
  - ボトムナビゲーション（未処理/履歴）
  - 詳細ビュー全要素のvw化（本文・差出人・日付・添付・メモ・ボタン）
  - 空状態オンボーディングメッセージ追加
  - `vs()` ヘルパー関数でJS生成HTMLもvw対応

## 開発ルール
- コード変更後は自動でコミット＆プッシュまで行う
- GASの権限：Gmail・Drive のみ（最小権限）
- デプロイ：GASエディタ → ウェブアプリ → 自分のみアクセス可
- モバイルサイズは必ず `vw` 単位を使うこと（px禁止）
- 新しい要素追加時は `.is-mobile` CSSオーバーライドも忘れず追加すること
