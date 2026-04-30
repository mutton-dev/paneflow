# paneflow

> tmux ペインで並走する Claude Code エージェントをリアルタイム監視する TUI

複数の Claude Code を並列実行しているとき、どのエージェントが動いていて、どれが止まっているかを一画面で把握できます。

---

## インストール

```bash
npm install -g paneflow
```

## 使い方

tmux セッションを開いた状態で、別ペインまたは別ウィンドウで起動します。

```bash
paneflow
```

`q` キーで終了します。

```
paneflow panes=4 working=3 idle=1 stuck=0

[%0] researcher ● working
  ✓ Bash ×12 | ✓ Read ×8 | ✓ WebSearch ×3
  ⏵⏵ bypass permissions on (shift+tab to cycle)

[%1] coder ● working
  ✓ Edit ×6 | ✓ Write ×2 | ✓ Bash ×1
  ⏵⏵ bypass permissions on (shift+tab to cycle)

[%2] reviewer ● idle
  All done. Press q to quit.

[%3] tester ● working
  ✓ Bash ×20 | 3 passed, 0 failed
  ⏵⏵ bypass permissions on (shift+tab to cycle)

press q to quit
```

## ステータスの見方

| ステータス | 色 | 意味 |
|---|---|---|
| `● working` | 緑 | 出力が変化している (正常稼働) |
| `● idle` | 黄 | 60 秒以上出力が止まっている (入力待ち・完了待ち) |
| `● stuck` | 赤 | 90 秒以上まったく変化なし (エラー・フリーズの可能性) |

`stuck` が出たら `tmux select-pane -t %XX` でそのペインに飛んで確認します。

## CLI オプション

```bash
paneflow            # ダッシュボード起動
paneflow --help     # ヘルプ表示
paneflow --version  # バージョン表示
```

## 動作要件

- Node.js ≥ 20
- tmux がインストールされていること
- Claude Code が tmux ペイン内で実行中であること

## ローカル開発

```bash
git clone https://github.com/mutton-dev/paneflow.git
cd paneflow
npm install
npm run dev     # ウォッチモードでビルド
npm test        # テスト実行
```

## 仕組み

2 秒ごとに `tmux list-panes -a` と `tmux capture-pane` を呼び出し、各ペインの末尾出力を取得します。前回との差分から経過時間を計測し、ステータスを判定します。

```
tmux list-panes → 各ペインの出力を capture → 前回と比較 → working / idle / stuck を判定
                                                    ↑ 2 秒ごとに繰り返す
```

## ライセンス

MIT — [Mutton's AI Lab](https://mutton.dev/lab) の一部として公開
