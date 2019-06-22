# Twimg Save
## なにこれ
Twitterの画像保存してくれるやつ
## なにがいるの
- Node.js
- Npm
- Electron
## せっとあっぷ
1. `mkdir gets`で画像を保存するフォルダーを作る
1. `.config.json`ってファイルを作る
2. そこに`{"save_dir": "./gets"}`って感じに書く
3. `npm install`
## つかいかた
1. `electron .`
2. Twitterでいい感じの画像のついたツイートを探す
3. そのツイートのURLをコピーしてTwimg Saveの`URL`って所に入れる
4. `Download`を押す
5. フォルダーにツイートに付いてる画像が全部保存される

