let express = require('express');
let app = express()
let path = require('path');
let http = require('http');
let config = require('./config');

//设置跨域访问
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.header("X-Powered-By", ' 3.2.1');
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
app.use(express.static(path.join(__dirname, 'log')))

app.use('/auto/git', require('./routes/git'));

// 创建服务
let server = http.createServer(app);
let port = config.port;
server.listen(port)
server.on('error', function () {
  console.log("service startup failed！");
});
server.on('listening', function () {
  console.log("server listening at http://localhost:" + port);
});