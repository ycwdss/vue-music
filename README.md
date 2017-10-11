# vue-music

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## 项目架构：
```
├src
│──api
├──assets
│   ├──font 字体资源
│   ├──image 图片
│   ├──js 公用js
│   │    ├── config
│   │    ├── mixin 
│   │    ├── singer
│   │    ├── song
│   ├──style
├── src
│   ├── component
│   │   ├── async
│   │   │   ├── css.css
│   │   │   ├── index.js
│   │   │   └── loading.js
│   │   ├── error
│   │   │   ├── css.css
│   │   │   └── index.js
│   │   └── nav
│   │       ├── css.css
│   │       └── index.js
│   └── css
│       └── css.css
├── main.js
├── router
│   ├── home
│   │   ├── css.css
│   │   └── index.js
│   ├── index.js
│   └── user
│       ├── css.css
│       └── index.js
└── stores
    ├── clickTimesStore.js
    ├── fetchStore.js
    └── index.js
```

