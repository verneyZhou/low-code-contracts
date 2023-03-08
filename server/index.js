const express = require('express');
var app = express();

const socketio = require('socket.io');
const server = require('http').createServer(app);
const io = socketio(server, { cors: true });
// 设置 socketio
app.set('socketio', io);


// body-parser是一个HTTP请求体解析的中间件，使用这个模块可以解析JSON、Raw、文本、URL-encoded格式的请求体
const bodyParser = require('body-parser');

const router = require('./router');



//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})


/// 中间件解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// 解析 application/json
app.use(bodyParser.json())
// 解析 text/plain
app.use(bodyParser.text());


app.use('/', router)


//使用app作为中间件开启WebSocket服务器，express框架的其他功能也都能使用
//必须用server监听端口，不会报错
//socket服务器监听连接，表示已经建立连接
io.on('connection',function(socket){

    console.log('=====socket已经connection====')

	//向当前请求连接的客户端发送一个消息
	// socket.emit('onContractDeploy', {code: 0, msg: 'server socket connect success !!!'});

	//向所有客户端发送消息
	// io.emit('msg',/**/);


	//监听客户端发来的消息
	socket.on('connectSuccess',function(data){
		console.log('客户端发来信息：', data);

		//将客户端发来的消息推送给全部的客户端
		// io.emit('msg',data);
	})
})


server.listen(8023, function() {
    const {address, port} = server.address();
    console.log('======Http server is running on http://%s:%s', address, port);
    // console.log('服务已启动，请打开链接：http://localhost:8023')
})