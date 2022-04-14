## プロトコルスイート
```
fed
HTTP
TLS
TCP
```

## データのフォーマット
fedで扱われる各種オブジェクトはJSON形式で配信される。

## サーバー
通信を行う2つのサーバーのうち、サービスを提供する側のサーバーのことをプロバイダと呼ぶ。
また、サービスを受けるサーバーのことをコンシューマと呼ぶ。

サーバーはプロバイダとコンシューマのどちらにもなることができる。

サーバーは1つ以上のサービスを持つ。

2つのサーバーの間でセッションを確立することにより、それ以降メッセージをやり取りすることができる。
セッションを確立する際はネゴシエーションを行う。
ネゴシエーションとは、両者が共通して持っているサービスを認識し、連合可能なサービスを列挙することを指す。

エンドポイント`/server`にGETリクエストを送信することで、サーバーのメタデータを取得できる。

メタデータの構造:
```ts
interface Metadata {
  services: string[];
}
```
servicesフィールドには、サービス記述子が配信されているURLの文字列が含まれる。

## サービス
サービスは標準的なものについては随時定義される。
定義されていないサービスは独自に定義することができる。

サービスを定義するには、サービス記述子を作成する。
サービス記述子では、やり取りされるメッセージの構造を定義できる。

サービス記述子の構造:
```ts
interface ServiceDescriptor {
  id: string;
  messages: {
    id: string;
    fields: { type: string, name: string }[];
  }[];
}
```

## メッセージ

### メッセージの検証
メッセージの内容はコンシューマ側で検証されるべきである。
具体的な検証方法についてはこの仕様では規定しない。

### リソース
メッセージに関係する画像や動画などのリソースは、メッセージの中ではURLの文字列によって表現される。

また、リソース自体はHTTPに従って配信される。
具体的なHTTPの仕様(バージョン等)については、この仕様では規定しない。

### メッセージの転送
メッセージは、エンドポイント`/server/port`で受け渡される。

## セッション
セッションを確立することでサーバー間の通信ができるようになる。
セッションの確立手順にはネゴシエーションが含まれる。
コンシューマがセッションを保持していなければセッションを得る。

サーバーは、サービス構成に変更があった場合に、保持しているセッションを全て破棄する。

プロバイダ側はメッセージを受け取った際に、そのサーバーのセッションが有効かどうかを判定する。
無効な場合はプロバイダが通信を拒否しセッションが無効であることを通知する。
コンシューマはセッションの再取得を行う。

コンシューマは以下の手順でメッセージの送信を試行する：
- そのサーバーとのセッションがない場合は、送信を保留しプロバイダとのセッションを確立する。
- セッションの確立に失敗した、またはプロバイダがそのサービスを提供していない場合は、送信をキャンセルする。
- プロバイダにメッセージを送信する。

### ネゴシエーション
コンシューマは、メタデータの内容をみてお互いのサーバーが通信可能かどうかを判断する。

## サーバーの識別・認証
未定。
- HTTP Signatureを使う？
- ホスト名をサーバーの認識に使用しない