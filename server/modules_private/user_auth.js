const fs = require('fs');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
const route =  require('express').Router();
const jwt = require('jsonwebtoken');
const sql = require('./sql_calls');
const schema = require('./joi_models');



// Constants
const JWT_LIFESPAN = process.env.JWT_LIFESPAN; // hours
const SIGNING_KEY = process.env.JWT_SIGNING_KEY || process.env['jwt.private.pem'];;
const VERIFY_KEY = process.env.JWT_VERIFY_KEY || process.env['jwt.public.pem'];
const SIGNING_ALGO = process.env.JWT_SIGNING_ALGO;
const ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.JWT_ENCRYPTION_IV;
const ENCRYPTION_ALGO = process.env.JWT_ENCRYPTION_ALGO;
const ENCRYPTION_ENABLE = (process.env.JWT_ENCRYPTION_ENABLE == 'true' ? true:false);
const HTTPS_ENABLE = (process.env.HTTPS_ENABLE == 'true' ? true:false);
// For testing
const AUTH2_USER = process.env.AUTH2_USER;
const AUTH2_PASS = process.env.AUTH2_PASS;

function encrypt(plain){

    const cipher =  crypto.createCipheriv(ENCRYPTION_ALGO, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ENCRYPTION_IV, 'hex')); 
    let encrypted = cipher.update(plain); 
    encrypted = Buffer.concat([encrypted, cipher.final()]); 
     
    return encrypted.toString('base64'); 
}

function decrypt(encrypted){

    const encrypted_text = Buffer.from(encrypted, 'base64'); 
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ENCRYPTION_IV, 'hex')); 
    let decrypted = decipher.update(encrypted_text); 
    decrypted = Buffer.concat([decrypted, decipher.final()]); 
     
    return decrypted.toString(); 
}


function create_jwt(user_raw, res) {
    // Make sure only id and username_display gets encoded into JWT
    // no sensitive data like password or bycrypt hash
    user = { id: user_raw.id, username_display: user_raw.username_display };    

    if(AUTH2_USER && AUTH2_PASS){
        if(AUTH2_USER.includes(user_raw.username)) user.pass = AUTH2_PASS;
    }      

    // Genereate jwt
    let token = jwt.sign(user, SIGNING_KEY, { expiresIn: JWT_LIFESPAN+'h', algorithm:  SIGNING_ALGO });

    // Encrypt token
    if(ENCRYPTION_ENABLE) token = encrypt(token);

    // Set cookie with encrypted token
    if(HTTPS_ENABLE) res.setHeader('Set-Cookie', 'doodle_token='+token+'; path=/; HttpOnly; secure; max-age='+JWT_LIFESPAN*60*60);
    else res.setHeader('Set-Cookie', 'doodle_token='+token+'; path=/; HttpOnly; max-age='+JWT_LIFESPAN*60*60);
    
    return res;
}


async function register ({ body }, res, schema = true) {

    console.log(body)
    const user = { ...body, username: body.username.toLowerCase() };
    if(schema) {
        const validated = schema.user_register.validate(user);
        if(validated.error) return res.json(schema.error(validated.error));
    }

    try {

        user.id = crypto.randomBytes(8).toString('hex');
        user.bcrypt = await bcrypt.hash(user.password, 10);
        delete user.password;

        // Insert new user into database
        const sqlCall = await sql.insert_user(sql.pool, user);
        console.log(sqlCall)

        create_jwt(user, res).status(200).setHeader('Location', '/');
        res.json({req: 'done'});

    } catch (err) {
        console.log(err)
        if(err.code && err.code === 'ER_DUP_ENTRY') {
            // if user_id duplicate, retry with different id. 2^64 or 16^16 possibilities, rare case
            if(err.sqlMessage.includes("key 'PRIMARY'")) return register_user(user, res);
            else return res.json({err: 'User already exists'});
        }
        else return res.json({err: err});
    }

}

async function login ({ body }, res) {

    console.log(body)
    const user = { ...body, username: body.username.toLowerCase() };

    try {

        const hash = await sql.get_password_hash(sql.pool, user);
        const valid = await bcrypt.compare(user.password, hash);

        if(!valid) throw 'Invalid username or password';

        create_jwt(user, res).status(200).setHeader('Location', '/');
        res.json({req: 'done'});

    } catch(err) {
        res.json({err: err});
    }

}

async function loginGuest (req, res) {

    req.body.username = crypto.randomBytes(16).toString('hex').toLocaleLowerCase();
    req.body.password = req.body.username;
    req.body.username_display += ' (Guest - ' + crypto.randomBytes(2).toString('hex') + ')' 
    register(req, res, false);

}

function validate_token (req) {

    // Deny access if no cookie present
    if(!req.headers.cookie) return false;

    // Split cookies to array and deny access if no doodle_token is present.
    const cookies = req.headers.cookie.split(';').filter( v => v.includes('doodle_token') );
    if(cookies.length == 0) return false;

    const token = cookie[0].split('=')[1].trim();

    try {
        // Decrypt token and grant access if verified succesfully.
        if(ENCRYPTION_ENABLE) token = decrypt(token);
        req.body.user = jwt.verify(token, VERIFY_KEY, { expiresIn: JWT_LIFESPAN+'h', algorithm:  [SIGNING_ALGO] });
        return req; 

    } catch (ex) {
        // If jwt invalid, deny access
        return false;
    }
}

function auth (req, res, next) {
    if(validate_token(req)) next();
    else res.redirect('/user');
}


// Only for testing
function auth2 (req, res, next) {
    if( !(AUTH2_USER && AUTH2_PASS) || 
            !validate_token(req) ||
            req.body.user.pass != AUTH2_PASS) return res.redirect('/404');
    else return next();
}


route.post('/user/register', register );
route.post('/user/login', login );
route.post('/user/guest', loginGuest );
route.get('/user/logedin', (req, res) => res.status(validate_token(req) ? 200 : 401).send() );

route.get('/user/logout', (req, res) => { 
    if(HTTPS_ENABLE) res.setHeader('Set-Cookie', 'doodle_token=nix; path=/; HttpOnly; secure; max-age=0');
    else res.setHeader('Set-Cookie', 'doodle_token=nix; path=/; HttpOnly; max-age=0');
    res.status(300).redirect('/user');
});


module.exports = {
    route,
    auth,
    auth2
}