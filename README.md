# env-dev-laravel-front

## overview
ローカルで Spring Boot プロジェクト開発をするためのdocker環境。<br>
バックエンドとフロントエンドにホットリロード機能を備えた開発環境を提供する。<br>

## composition
- Docker
- Nginx
- MySQL
- Node.js
- Redis

## 前提
- 以下の前提で本リポジトリの開発環境を構築する想定です。
  - バックエンド: Spring Boot
  - フロントエンド: Thymeleaf + Vue.js
  - プロジェクト名: `demo`
- バックエンド（Spring Boot）は自動リロード可能な環境を提供します。
  - コンテナでファイル変更を検知して継続的にビルド待ちの状態にする(内部動作は`./gradlew build --continuous`)
  - コンテナ内でbootRunオプション起動します(内部動作は`./gradlew bootRun`)
- フロントエンドは Node.js コンテナ内でホットリロードを行います(内部動作は`npm run dev`)

## Usega (example of How to prepare environment for develop)

### 1. プロジェクト作成
プロジェクト名`demo`を作成。
変更する場合は適宜読み替え、`docker-compose.yaml`内のボリュームマウント先も変更すること。

(ローカル)
```shell
curl -s https://start.spring.io/starter.zip \
  -d type=gradle-project \
  -d language=java \
  -d bootVersion=3.5.3 \
  -d baseDir=demo \
  -d groupId=com.example \
  -d artifactId=demo \
  -d name=demo \
  -d description="Demo project for Spring Boot" \
  -d packageName=com.example.demo \
  -d packaging=jar \
  -d javaVersion=17 \
  -d dependencies=web,thymeleaf,devtools \
  -o demo.zip
```

