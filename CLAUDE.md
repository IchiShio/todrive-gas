# CLAUDE.md - todrive-gas

## プロジェクト概要
GmailのメールをGoogle Driveに整理保存するiPhone PWA。
Google Apps Script（GAS）で実装。APIキー不要・無料で動作。

## 技術スタック
- Google Apps Script（サーバーレス）
- HTML / CSS / JavaScript（Tailwind CDN）
- Font Awesome 6

## 主要ファイル
| ファイル | 説明 |
|---|---|
| `Code.gs` | GASバックエンド（メール取得・Drive保存） |
| `Index.html` | フロントエンドUI（レスポンシブ2カラム） |

## 機能
- `ToDrive` ラベル付きメールを一覧表示
- メール本文を `.md` 形式で Drive に保存（DocumentApp不使用）
- 処理指示メモ（`.md`）も同フォルダに保存
- 添付ファイルも同フォルダに保存
- 処理済みメールに `Processed` ラベルを付与しアーカイブ
- デスクトップ：左右2カラムUI / モバイル：スライドイン詳細

## 2026-02-24 作業記録
- Code.gs: メール取得・詳細・Drive保存を実装
  - `DocumentApp` を廃止し `folder.createFile()` で `.md` 直接生成
  - ルートフォルダ汚染バグを修正（`removeFile` 追加）
  - `window.prompt()` をカスタムモーダルに置き換え（iOS Safari対応）
  - ローディングUIを追加
- Index.html: レスポンシブUIを実装
  - デスクトップ：左パネル（一覧）+ 右パネル（詳細・メモ）の2カラム
  - モバイル：フルスクリーンスライドイン詳細
  - XSSエスケープ追加

## 開発ルール
- コード変更後は自動でコミット＆プッシュまで行う
- GASの権限：Gmail・Drive のみ（最小権限）
- デプロイ：GASエディタ → ウェブアプリ → 自分のみアクセス可
