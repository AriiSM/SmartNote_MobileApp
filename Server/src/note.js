import Router from 'koa-router';
import {RepoDB} from "./repoDB.js";
import {broadcast} from "./wss.js";

const itemStore = new RepoDB("data/note.json");

const itemRouter = new Router();

itemRouter.get('/', async (ctx) => {
    const userId = ctx.state.user.id;
    ctx.response.body = await itemStore.findNotesByUserId( userId );
    ctx.response.status = 200;
});

itemRouter.get('/page/:nr', async (ctx) => {
    const userId = ctx.state.user.id;
    const page_nr = parseInt(ctx.params.nr, 10);
    ctx.response.body = await itemStore.findNotesByUserID_paginated(userId, page_nr);
    ctx.response.status = 200;
});

itemRouter.get('/page/:nr/:search?', async (ctx) => {
    const userId = ctx.state.user.id;
    const page_nr = parseInt(ctx.params.nr, 10);
    const search = ctx.params.search;
    ctx.response.body = await itemStore.searchNoteByUserID_paginated(userId, page_nr,search);
    ctx.response.status = 200;
});

itemRouter.get('/page/:nr/filter/:filter?', async (ctx) => {
    const userId = ctx.state.user.id;
    const page_nr = parseInt(ctx.params.nr, 10);
    const filter = ctx.params.filter;
    ctx.response.body = await itemStore.filterNoteByUserID_paginated(userId, page_nr, filter);
    ctx.response.status = 200;
});



itemRouter.get('/:id', async (ctx) => {
    const userId = ctx.state.user.id;
    const item = await itemStore.findOneNoteById(ctx.params.id);
    console.log(ctx.params.id, ctx.state.user.id, item)
    const response = ctx.response;
    if (item) {
        if (item.userId === userId) {
            ctx.response.body = item;
            ctx.response.status = 200;
        } else {
            ctx.response.status = 403;
        }
    } else {
        ctx.response.status = 404;
    }
});

// const createItem = async (ctx, item, response) => {
//     try {
//         item.userID = ctx.state.user.id;
//         response.body = await itemStore.insert(item);
//         response.status = 201; // created
//     } catch (err) {
//         response.body = { message: err.message };
//         response.status = 400; // bad request
//     }
// };

const createItem = async (ctx, item, response) => {
    try {
        item.userID = ctx.state.user.id;
        item = await itemStore.createNote(item);
        response.body = item;
        response.status = 201;
        broadcast(item.userID, { type: 'created', payload: item });
    } catch (err) {
        response.body = { message: err.message };
        response.status = 400; 
    }
};

itemRouter.post('/', async ctx => await createItem(ctx, ctx.request.body, ctx.response));


//TODO: may not work
itemRouter.put('/:id', async ctx => {
    const item = ctx.request.body;
    const id = ctx.params.id;
    const itemId = item.id;
    const response = ctx.response;

    if (itemId && itemId !== id) {
        response.body = { message: 'Param id and body id should be the same' };
        response.status = 400;
        return;
    }

    if (!itemId) {
        await createItem(ctx, item, response);
    } else {
        item.userID = ctx.state.user.id; 
        try {
            const updatedNote = await itemStore.updateNote(item);
            response.body = updatedNote;
            response.status = 200;
            broadcast(item.userID, { type: 'updated', payload: updatedNote });
        } catch (err) {
            response.body = { message: err.message };
            response.status = 400; 
        }
    }
});

itemRouter.del('/:id', async (ctx) => {
    const userId = ctx.state.user.id;
    const item = await itemStore.findOneNoteById(ctx.params.id);
    if (item && userId !== item.userId) {
        ctx.response.status = 403; 
    } else {
        await itemStore.remove({ _id: ctx.params.id });
        ctx.response.status = 204; 
    }
});

export default itemRouter;