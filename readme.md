# Twimg Save
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fcoke12103%2FTwimg-Save.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fcoke12103%2FTwimg-Save?ref=badge_shield)

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
2. `npm install`
## つかいかた
1. `electron .`
2. 対応したSNSでいい感じの画像のついた投稿を探す
3. その投稿のURLをコピーしてTwimg Saveの`URL`って所に入れる
4. `Download`を押す
5. フォルダーに投稿に付いてる画像が全部保存される



## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fcoke12103%2FTwimg-Save.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fcoke12103%2FTwimg-Save?ref=badge_large)