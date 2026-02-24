function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ToDrive')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 未処理 or 履歴メール取得
function getEmails(isHistory, forceRefresh) {
  var cacheKey = isHistory ? 'emails_history' : 'emails_pending';
  var cache = CacheService.getUserCache();

  if (!forceRefresh) {
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  var query = isHistory ? 'label:Processed' : 'label:ToDrive -label:Processed';
  var threads = GmailApp.search(query, 0, 20);
  var emails = [];
  threads.forEach(function(t) {
    var messages = t.getMessages();
    var m = messages[messages.length - 1]; // スレッド最新メッセージのみ
    emails.push({
      id: m.getId(),
      subject: m.getSubject() || '(無題)',
      from: m.getFrom().split('<')[0].trim(),
      date: Utilities.formatDate(m.getDate(), 'JST', 'yyyy/MM/dd HH:mm'),
      snippet: t.getSnippet(),
      attachmentCount: m.getAttachments().length
    });
  });
  emails.sort(function(a, b) { return b.date.localeCompare(a.date); });

  try { cache.put(cacheKey, JSON.stringify(emails), 60); } catch(e) {}
  return emails;
}

// メール詳細取得
function getEmailDetail(id) {
  var msg = GmailApp.getMessageById(id);
  var atts = msg.getAttachments().map(function(a) {
    return {
      name: a.getName(),
      size: (a.getSize() / 1024).toFixed(1) + 'KB'
    };
  });
  return {
    id: id,
    subject: msg.getSubject() || '(無題)',
    from: msg.getFrom(),
    date: Utilities.formatDate(msg.getDate(), 'JST', 'yyyy/MM/dd HH:mm'),
    body: msg.getBody(),
    attachments: atts
  };
}

// Drive保存処理
function processToDrive(emailId, memoText, customFolderName) {
  var msg = GmailApp.getMessageById(emailId);
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'JST', 'yyyyMMdd');

  // フォルダ名
  var safeName = (msg.getSubject() || 'no-subject')
    .substring(0, 12)
    .replace(/[^\w\u3000-\u30FF\u4E00-\u9FFF]/g, '');
  var senderName = msg.getFrom().split('<')[0].trim().substring(0, 8);
  var folderName = customFolderName ||
    (dateStr + '_' + safeName + '_' + senderName);

  // Driveフォルダ作成
  var folder = DriveApp.getRootFolder().createFolder(folderName);

  // 00_処理指示メモ.md
  var memoContent =
    '# 処理指示メモ\n\n' +
    (memoText || '（メモなし）') + '\n\n' +
    '---\n' +
    '**保存日時:** ' + Utilities.formatDate(now, 'JST', 'yyyy/MM/dd HH:mm') + '\n';
  folder.createFile('00_処理指示メモ.md', memoContent, MimeType.PLAIN_TEXT);

  // 01_メール本文.md
  var subject = msg.getSubject() || '(無題)';
  var from    = msg.getFrom();
  var date    = Utilities.formatDate(msg.getDate(), 'JST', 'yyyy/MM/dd HH:mm');
  var bodyContent =
    '# ' + subject + '\n\n' +
    '| | |\n|---|---|\n' +
    '| **From** | ' + from + ' |\n' +
    '| **Date** | ' + date + ' |\n\n' +
    '---\n\n' +
    msg.getPlainBody();
  folder.createFile('01_メール本文.md', bodyContent, MimeType.PLAIN_TEXT);

  // 添付ファイル保存
  msg.getAttachments().forEach(function(att) {
    var file = folder.createFile(att);
    file.setName(dateStr + '_' + att.getName());
  });

  // Gmailラベル付与 + アーカイブ
  var processedLabel = GmailApp.getUserLabelByName('Processed') ||
    GmailApp.createLabel('Processed');
  msg.getThread().addLabel(processedLabel);
  msg.getThread().moveToArchive();

  // キャッシュ無効化（次回ロードで最新状態を反映）
  var cache = CacheService.getUserCache();
  cache.remove('emails_pending');
  cache.remove('emails_history');

  return {
    success: true,
    folderUrl: folder.getUrl(),
    folderName: folderName
  };
}
