# ToDrive - Gmail → Google Drive iPhone PWA

## セットアップ手順（5分）

### 1. Gmailラベル作成
- Gmailで「ToDrive」ラベルを作成（「Processed」は自動作成されます）

### 2. Google Apps Script 設定
1. https://script.google.com を開く
2. **新規プロジェクト** → プロジェクト名を「ToDrive iPhone」に変更
3. `Code.gs` の内容をすべて削除 → `Code.gs` の内容を貼り付け → 保存（Cmd+S）
4. 左パネルの「+」→「HTML」→ ファイル名「Index」→ `Index.html` の内容をすべて貼り付け → 保存

### 3. デプロイ
1. 右上「デプロイ」→「新しいデプロイ」
2. 種類：**ウェブアプリ**
3. 「次のユーザーとして実行」→ **自分（your@gmail.com）**
4. 「アクセスできるユーザー」→ **自分のみ**
5. 「デプロイ」→ URLをコピー

### 4. iPhoneでアプリ化
1. SafariでデプロイURLを開く（初回はGoogleログイン + 権限許可）
2. 共有ボタン → **「ホーム画面に追加」** → 名前「ToDrive」→ 追加
3. ホーム画面のアイコンをタップ → フルスクリーンアプリとして起動

## 使い方
1. Gmailでメールを開き「ToDrive」ラベルを付ける
2. ToDriveアプリを開く → 一覧に反映
3. メールをタップ → 本文確認 → メモ入力 → 「Driveに保存」
4. フォルダ名を指定（空欄で自動生成）→ 「保存実行」
5. DriveにフォルダとDocが作成され、メールは自動アーカイブ

## バグ修正済み（元コードから）
- Documentファイルがルートフォルダに残る問題を修正（removeFile追加）
- `window.prompt()`をカスタムモーダルに置き換え（iOS Safariで動かない問題）
- 処理中のローディングUIを追加（ユーザーが操作できない状態を明示）
- XSSエスケープ追加（件名・送信者名のHTML特殊文字対応）
