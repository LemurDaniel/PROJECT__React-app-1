const fs = require('fs');
const crypto = require('crypto');
const routes =  require('express').Router();

const sql = require('./sql_calls');
const schema = require('./joi_models');
const { auth, validate_token } = require('./user_auth');



async function addTask( req, res) {

    const task = { ...req.body, user: req.body.user.id, id: crypto.randomBytes(8).toString('hex') };
    const validated = schema.task.validate(task);
    if(validated.error) return res.status(400).json(schema.error(validated.error));

    try {

        await sql.insertTask(sql.pool, task);

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

    console.log(req.query)
    if(req.query.token) {
        req.body = { token: req.query.token };
    }

    validate_token(req);
    const params = { ...req.body, user: req.body.user.id };

    try {

        console.log(params)
        const data = await sql.searchTasks(sql.pool, params);
    
        console.log(data)
        res.status(200);

    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }

}

async function deleteTask(req, res) {

    console.log(req.query)
    if(req.query.token) {
        req.body = { token: req.query.token };
    }

    validate_token(req);
    const params = { ...req.body, user: req.body.user.id };

    try {

        const id = req.query.id;
        console.log(params)
        const data = await sql.deleteTask(sql.pool, id, req.body.user.id);
    
        console.log(data)
        res.status(200).json(data);

    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }

}


// POSTS //
routes.post('/tasks', auth, addTask);
routes.get('/tasks', getTasks);
routes.delete('/tasks', deleteTask);


module.exports = { 
    routes
 }