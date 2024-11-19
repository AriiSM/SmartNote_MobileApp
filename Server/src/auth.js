import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import { jwtConfig } from './utils.js';
import {RepoDB} from "./repoDB.js";

const userStore = new RepoDB("data/users.json");

const createToken = (user) => {
    return jwt.sign({ username: user.username, id: user.id }, jwtConfig.secret, { expiresIn: 60 * 60 * 60 });
};

const authRouter = new Router();

// authRouter.post('/signup', async (ctx) => {
//     try {
//         const user = ctx.request.body;
//         await userStore.createUser(user);
//         ctx.response.body = { token: createToken(user) };
//         ctx.response.status = 201;
//     } catch (err) {
//         ctx.response.body = { error: err.message };
//         ctx.response.status = 400;
//     }
//
//     await createUser(ctx.request.body, ctx.response)
// });

authRouter.post('/login', async (ctx) => {
    const credentials = ctx.request.body;
    const user = await userStore.findUserByUsername(credentials.username);
    if (user && credentials.password === user.password) {
        ctx.response.body = {
            token: createToken(user),
            user: {
                username: user.username,
                id: user.id
            }
        };
        ctx.response.status = 201; 
    } else {
        ctx.response.body = { error: 'Invalid credentials' };
        ctx.response.status = 400; 
    }
});

authRouter.post('/login', async (ctx) => {
    const credentials = ctx.request.body;
    const user = await userStore.findUserByUsername(credentials.username);
    if (user && credentials.password === user.password) {
        ctx.response.body = { token: createToken(user) };
        ctx.response.status = 201; 
    } else {
        ctx.response.body = { error: 'Invalid credentials' };
        ctx.response.status = 400; 
    }
});


export default authRouter;