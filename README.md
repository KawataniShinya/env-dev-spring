# env-dev-spring

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

### 1. コンテナビルド
(ローカル)
```shell
docker compose build
```

### 2. プロジェクト作成
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

```shell
unzip demo.zip
```

### 2. プロジェクト設定
#### Spring Security, JPA, MySQL, Redis 依存関係追加
`demo/build.gradle`に以下を追記。

```gradle
dependencies {
    // 追加
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'com.mysql:mysql-connector-j'
    implementation 'org.springframework.session:spring-session-data-redis'
	implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

#### application.properties 設定
`demo/src/main/resources/application.properties`をリネーム。
```shell
mv application.properties application.yml
```

`demo/src/main/resources/application.yml`に下記内容に設定。
```yaml
spring:
  datasource:
    url: jdbc:mysql://spring-db:3306/spring_sample
    username: springUser
    password: password000
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  data:
    redis:
      host: redis
      port: 6379
  session:
    store-type: redis

logging:
  level:
    org.springframework.security: DEBUG
```

### 3. フロントエンド設定
#### Node.js コンテナ起動
`docker-compose.yaml`のspring-nodeサービスのcommandを`bash`に変更してから起動。
起動した時点でホスト側に`demo/src/main/frontend`が作成されている。

(ローカル)
```shell
docker compose up -d spring-node
docker compose exec spring-node bash
```

#### Vue.js プロジェクト作成
(node コンテナ)
```shell
cd /app/src/main/frontend
npm create vite@latest . -- --template vue
exit
```

(ローカル)
```shell
docker compose down
```

`docker-compose.yaml`のspring-nodeサービスのcommandを`docker`に変更

#### ビルド設定の追加
`demo/src/main/frontend/vite.config.js`に下記を追記。
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 追加部分
  build: {
    outDir: '../resources/static/dist', // Spring Boot から参照可能な場所
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
```

#### package.json 修正
`demo/src/main/frontend/package.json`の該当箇所を下記のように修正。
```
{
  ...
  "scripts": {
    ...
    "build": "vite build --watch", // 変更部分
    ...
    "docker": "vite --host localhost.spring-node.sample.jp --port 80" // 追加部分
  },
  ...
}
```

#### Vite設定修正
`demo/src/main/frontend/vite.config.js`を下記のように修正。
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../resources/static/dist', // Spring Boot から参照可能な場所
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  // 追加部分
  server: {
    watch: {
      usePolling: true,
    },
    allowedHosts: ['localhost.spring-app-dev.sample.jp'],
  }
})
```


### 4. データベース作成
#### DBコンテナ起動
(ローカル)
```shell
docker compose up -d spring-db
```

#### ユーザー、データベース作成
(db コンテナ)
```shell
docker compose exec spring-db bash
mysql -u root -proot -e "CREATE USER 'springUser' IDENTIFIED BY 'password000'"
mysql -u root -proot -e "GRANT all ON *.* TO 'springUser'"
mysql -u root -proot -e "FLUSH PRIVILEGES"
mysql -u root -proot -e "CREATE DATABASE spring_sample"
exit
```

(ローカル)
```shell
docker compose down
```

### 5. 初期画面(Hello World)作成
#### コントローラー作成
`demo/src/main/java/com/example/demo/HelloController.java`
```java
package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HelloController {
    @GetMapping("/")
    public String home() {
        return "redirect:/hello";
    }

    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("message", "Hello, World!");
        return "hello";
    }
}
```

#### Thymeleafテンプレート作成
`demo/src/main/resources/templates/hello.html`
```html
<!DOCTYPE html>
<html lang="ja" xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8" />
  <title>Hello</title>
</head>
<body>
<h1 th:text="${message}">Hello, World!</h1>
<p><a th:href="@{http://localhost.spring-app-dev.sample.jp/logout}" href="http://localhost.spring-app-dev.sample.jp/logout">Logout</a></p>
</body>
</html>
```

### 6. hosts設定
(ローカル)

hosts に下記エントリーを追加
```shell
127.0.0.1 localhost.spring-app-dev.sample.jp
127.0.0.1 localhost.spring-node.sample.jp
```

### 7. コンテナ起動
(ローカル)
```shell
docker compose build
docker compose up -d
```

`spring-app-dev`コンテナ起動時に、Spring Securityの初期ログインパスワードがコンソールに表示されるので控えておく。
```
...
Using generated security password: efbb0729-...
...
```

### 8. 動作確認
#### 画面確認
ブラウザで下記URLにアクセスし、Spring Bootのデフォルト画面が表示されることを確認。
- http://localhost.spring-app-dev.sample.jp
  - Username: `user`
  - Password: (コンソールに表示されたパスワード)

#### セッション(Redis)確認
(ローカル)
```shell
docker compose exec redis sh
```

(redis コンテナ)
```shell
data # redis-cli

127.0.0.1:6379> KEYS *
1) "spring:session:sessions:ff6b9fc9-04b5-4e9d-b484-1a4863b4ebfe"

127.0.0.1:6379> HGETALL spring:session:sessions:ff6b9fc9-04b5-4e9d-b484-1a4863b4ebfe
1) "creationTime"
2) "\xac\xed\x00\x05sr\x00\x0ejava.lang.Long;\x8b\xe4\x90\xcc\x8f#\xdf\x02\x00\x01J\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\x01\x9a\x85\x99|\xe7"
3) "sessionAttr:org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository.CSRF_TOKEN"
...
```

## 本番デプロイモジュールの作成と動作確認
### 1. デプロイモジュールの作成
コンテナを起動した状態で実行。
(ローカル)
```shell
docker compose exec spring-app-dev bash
```

デプロイモジュールの作成
(spring-app-dev コンテナ)
```shell
./gradlew bootJar
```
```
./gradlew bootJar
> Task :compileJava UP-TO-DATE
> Task :processResources
> Task :classes
> Task :resolveMainClassName
> Task :bootJar

BUILD SUCCESSFUL in 16s
4 actionable tasks: 3 executed, 1 up-to-date
```
```shell
exit
```

### 2. デプロイモジュールの動作確認
コンテナ起動させるためにはアクセス先のデータベースが必要で、そのままでは起動に失敗するため、ここでは手順のみ記載。

(ローカル)
```shell
ls -l% ls -l ./demo/build/libs/demo-0.0.1-SNAPSHOT.jar
-rw-r--r--  1 hoge  hoge  68816806 11月 15 13:45 ./demo/build/libs/demo-0.0.1-SNAPSHOT.jar 
```

```shell
docker run --rm \
  -p 80:8080 \
  -v $(pwd)/demo/build/libs/demo-0.0.1-SNAPSHOT.jar:/app/app.jar \
  openjdk:17-slim \
  java -jar /app/app.jar
```

### ToDo
- アプリケーションコンテナがアクセスするデータベースを準備