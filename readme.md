# Twimg Save
## なにこれ
Twitterの画像保存してくれるやつ
## なにがいるの
- Node.js
- Npm
- Electron
## せっとあっぷ
1. `mkdir gets`で画像を保存するフォルダーを作る
1. `.config.json.sample`をコピーして`.config.json`を作る
2. もしクリップボード監視を使いたいなら`.config.json`の`clipboard_check`を`true`にする
3. `npm install`
## つかいかた
1. `electron .`
2. Twitterでいい感じの画像のついたツイートを探す
3. そのツイートのURLをコピーしてTwimg Saveの`URL`って所に入れる
4. `Download`を押す
5. フォルダーにツイートに付いてる画像が全部保存される

