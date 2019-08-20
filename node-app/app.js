'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');

const PORT = process.env['PORT'] || 3030;
const app = new Koa();
const router = new Router();

router
    .get('/api', (ctx, next) => {
        ctx.body = '<h1>Node API</h1>';
    })

app
    .use(logger())
    .use(router.routes())
    .use(router.allowedMethods());

const server = require('http').createServer(app.callback());
server.listen(PORT);
console.log(`Server on localhost:${PORT}`);

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('connected');
    socket
        .on('io-ping', (msg) => {
            console.log(`io-ping: ${msg}`);
            socket.emit('io-pong', msg);
        })
});