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
## ちなみに
MisskeyとMastodonでは動画も保存できます
## せっとあっぷ
1. `mkdir gets`で画像を保存するフォルダーを作る
2. `.config.json.sample`をコピーして`.config.json`を作る
3. もしクリップボード監視を使いたいなら`.config.json`の`clipboard_check`を`true`にする
4. MastodonまたはMisskeyの画像のファイル名にインスタンスのドメインがほしいなら`.config.json`の`extension_domain`を`true`にする
5. `npm install`
## つかいかた
1. `electron .`
2. 対応したSNSでいい感じの画像のついた投稿を探す
3. その投稿のURLをコピーしてTwimg Saveの`URL`って所に入れる
4. `Download`を押す
5. フォルダーに投稿に付いてる画像が全部保存される

