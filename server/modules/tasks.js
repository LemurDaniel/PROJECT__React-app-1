const fs = require('fs');
const crypto = require('crypto');
const routes =  require('express').Router();

const sql = require('./sqlCalls');
const schema = require('./joiModels');
const { auth, validate_token } = require('./userAuth');
const { checkCache, deleteCache } = require('./caching');



async function addTask( req, res) {

    let flag_update = false;
    console.log(req.body)
    if(req.body.id) flag_update = true;
    else req.body.id = crypto.randomBytes(8).toString('hex');

    const task = { ...req.body, user: req.body.user.id  };
    const validated = schema.task.validate(task);
    if(validated.error) return res.status(400).json(schema.error(validated.error));

    try {

        if(flag_update) await sql.updateTask(sql.pool, task);
        else await sql.insertTask(sql.pool, task);

        const date = new Date(task.date).toISOString().split('T')[0];
        await deleteCache('GET', '/tasks', { date: date }, { user: req.body.user }, true); 

        delete task.user;
        res.status(200).json(task);

    } catch (err) {
        console.log(err)
        // Id could be duplicate but with 2^64 or 16^16 possibilities it is a rare case.
        if(err.code && err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes("key 'PRIMARY'")) 
            return addTask(req, res);
        else 
            return res.status(500).json(err)
    }

}

async function getTasks(req, res) {

    checkCache(req, res, 60, true, async params => {
        return await sql.queryTasks(sql.pool, { ...req.query, user: req.body.user.id });
    })

}

async function deleteTask(req, res) {

    const params = { ...req.body, user: req.body.user.id };

    try {

        const id = req.query.id;
        console.log(params)

        const date = await sql.getTaskDate(sql.pool, id, req.body.user);
        await deleteCache('GET', '/tasks', { date: date }, { user: req.body.user }, true); 

        const data = await sql.deleteTask(sql.pool, id, req.body.user);
    
        console.log(data)
        res.status(200).json(data);

    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }

}


// POSTS //
routes.post('/tasks', auth, addTask);
routes.get('/tasks', auth, getTasks);
routes.delete('/tasks', auth, deleteTask);


module.exports = { 
    routes
}