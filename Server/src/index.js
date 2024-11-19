import http from 'http';
import Koa from 'koa';
import WebSocket from 'ws';
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";
import jwt from 'koa-jwt';
import cors from '@koa/cors';
import { jwtConfig, timingLogger, exceptionHandler } from './utils.js';
import itemRouter from './note.js';
import authRouter from './auth.js';
import {initWss} from "./wss.js";

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });
initWss(wss);

app.use(cors({
    origin: 'http://localhost:8100',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
}));
app.use(timingLogger);
app.use(exceptionHandler);
app.use(bodyParser());

const prefix = '/api';

// public
const publicApiRouter = new Router({ prefix });
publicApiRouter
    .use('/auth', authRouter.routes());
app
    .use(publicApiRouter.routes())
    .use(publicApiRouter.allowedMethods());

app.use(jwt(jwtConfig));

// protected
const protectedApiRouter = new Router({ prefix });
protectedApiRouter
    .use('/note', itemRouter.routes());
app
    .use(protectedApiRouter.routes())
    .use(protectedApiRouter.allowedMethods());

server.listen(3000);
console.log('started on port 3000');