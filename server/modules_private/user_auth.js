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
    // Make sure only id and userDisplayName gets encoded into JWT
    // no sensitive data like password or bycrypt hash
    user = { id: user_raw.id, userDisplayName: user_raw.userDisplayName };    

    /*
    if(AUTH2_USER && AUTH2_PASS){
        if(AUTH2_USER.includes(user_raw.username)) user.pass = AUTH2_PASS;
    }      
*/
    // Genereate jwt
    let token = jwt.sign(user, SIGNING_KEY, { expiresIn: JWT_LIFESPAN+'h', algorithm:  SIGNING_ALGO });

    // Encrypt token
    if(ENCRYPTION_ENABLE) token = encrypt(token);

    const cookieMeta = '; Path=/; HttpOnly; '+ ( HTTPS_ENABLE ? 'secure; ' : '' ) +' max-age='+ (JWT_LIFESPAN*60*60) + '; ';
    res.cookie('user='+user.userDisplayName + cookieMeta);
    res.cookie('doodle_token='+token + cookieMeta);
    
    return res.status(200).json({ userDisplayName: user.userDisplayName, token: token });
}


async function register ({ body }, res, validate = true) {

    console.log(body)
    const user = { ...body, username: body.username.toLowerCase() };
    if(validate) {
        const validated = schema.user_register.validate(user);
        if(validated.error) return res.json(schema.error(validated.error));
    }

    try {

        user.id = crypto.randomBytes(8).toString('hex');
        user.bcrypt = await bcrypt.hash(user.password, 10);
        delete user.password;

        // Insert new user into database
        await sql.insert_user(sql.pool, user);

        create_jwt(user, res);

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

    const user = { ...body, username: body.username.toLowerCase() };

    try {

        const hash  = await sql.get_password_hash(sql.pool, user);
        const valid = await bcrypt.compare(user.password, hash);

        if(!valid) throw 'Invalid username or password';

        create_jwt(user, res);

    } catch(err) {
        console.log(err)
        res.status(401).json({err: err});
    }

}

async function loginGuest (req, res) {

    req.body.username = crypto.randomBytes(16).toString('hex').toLocaleLowerCase();
    req.body.password = req.body.username;
    req.body.userDisplayName += ' (Guest - ' + crypto.randomBytes(2).toString('hex') + ')' 
    register(req, res, false);

}

function validate_token (req) {

    if(req.body.token) {
        try {

            // Decrypt token and grant access if verified succesfully.
            const token = req.body.token;
            delete req.body.token;
            if(ENCRYPTION_ENABLE) token = decrypt(token);
    
            req.body.user = jwt.verify(token, VERIFY_KEY, { expiresIn: JWT_LIFESPAN+'h', algorithm:  [SIGNING_ALGO] });
            return req; 
    
        } catch (ex) {
            // If jwt invalid, deny access
            return false;
        }
    }

    // Deny access if no cookie present
    let cookies = req.headers.cookie;
    if(!cookies) return false;

    // Split cookies to array and deny access if no doodle_token is present.
    cookies = cookies.split(';').filter( v => v.includes('doodle_token') );
    if(cookies.length == 0) return false;


    try {

        // Decrypt token and grant access if verified succesfully.
        const token = cookies[0].split('=')[1].trim();
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
    else res.status(401).send();
}

function auth2 (req, res, next) {
    res.status(401).send();
}

route.get('/cookie', (req, res) => {
    create_jwt({ username: 'test' }, res)
} );

route.post('/user/register', register );
route.post('/user/login', login );
route.post('/user/guest', loginGuest );

route.get('/user', (req, res) => {
    if(!validate_token(req)) res.status(401).send()
    else res.status(200).send(req.body.user.userDisplayName)
});

route.get('/user/logout', (req, res) => { 
    if(HTTPS_ENABLE) res.setHeader('Set-Cookie', 'doodle_token=nix; path=/; HttpOnly; secure; max-age=0');
    else res.setHeader('Set-Cookie', 'doodle_token=nix; path=/; HttpOnly; max-age=0');
    res.status(300).redirect('/user');
});


module.exports = {
    route,
    validate_token,
    auth2,
    auth
}