# Twimg Save
## なにこれ
いろんなSNSの画像保存してくれるやつ
## なにがいるの
- Node.js
- Npm
- Electron
## どこのSNSの画像保存できるの
- Twitter
- Misskey
- Mastodon
- Pleroma
- Pixiv
- Danbooru(danbooru.donmai.us)
- Yandere(yande.re)
## ちなみに
- Twitter以外では基本的にすべての添付ファイルが保存できます
- PixivはIP BAN対策のため、最大2.5秒の待機を挟んでいます
## 命名規則
基本的には以下の命名規則でファイルを保存するようになっています
```{SNSの種類}_{ユーザーのID}_{投稿ID}_image{枚目}.{拡張子}```

## 自動保存モードについて
クリップボード監視でセットされたURLを自動でダウンロードしてくれるだけの大量保存の時に便利な機能

## せっとあっぷ
1. `mkdir gets`で画像を保存するフォルダーを作る
2. `.config.json.sample`をコピーして`.config.json`を作る
3. もしクリップボード監視を使いたいなら`.config.json`の`clipboard_check`を`true`にする
4. MastodonまたはMisskeyの画像のファイル名にインスタンスのドメインがほしいなら`.config.json`の`file_name_domain`を`true`にする
5. `npm install`
## つかいかた
1. `electron .`
2. 対応したSNSでいい感じの画像のついた投稿を探す
3. その投稿のURLをコピーしてTwimg Saveの`URL`って所に入れる
4. `Download`を押す
5. フォルダーに投稿に付いてる画像が全部保存される

