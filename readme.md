# Backlog export

export backlog wiki and issue

## Install

```
$ git clone https://github.com/shizone/backlog-export.git
$ npm install
```

## Settings

1. copy env.js.example -> env.js
1. modify env.js

```javascript
module.exports = {
  backlog_host: 'https://hoge.backlog.com/',
  api_key: 'thisissecret',
  project_id: '9999'
}
```

[https://developer.nulab.com/ja/docs/backlog/](https://developer.nulab.com/ja/docs/backlog/)
