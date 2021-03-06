const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const routes =  require('express').Router();
const jwt = require('jsonwebtoken');
const sql = require('./sqlCalls');
const schema = require('./joiModels');



// Constants
const JWT_LIFESPAN = process.env.JWT_LIFESPAN ?? 12; // hours
const SIGNING_KEY = fs.readFileSync(path.join(__dirname, '..', process.env.JWT_SIGNING_KEY));
const VERIFY_KEY = fs.readFileSync(path.join(__dirname, '..', process.env.JWT_VERIFY_KEY));
const SIGNING_ALGO = process.env.JWT_SIGNING_ALGO ?? 'RS256';
const ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.JWT_ENCRYPTION_IV;
const ENCRYPTION_ALGO = process.env.JWT_ENCRYPTION_ALGO ?? 'aes-256-cbc';
const ENCRYPTION_ENABLE = process.env.JWT_ENCRYPTION_ENABLE === 'true';
const HTTPS_ENABLE = process.env.HTTPS_ENABLE === 'true';



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


function createJwt(userRaw, res) {

    // Make sure only id and userDisplayName gets encoded into JWT
    // no sensitive data like password or bycrypt hash
    user = { id: userRaw.id, userDisplayName: userRaw.userDisplayName };    

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
    // res.cookie('user='+user.userDisplayName + cookieMeta);
    res.cookie('doodle_token='+token + cookieMeta);
    
    return res.status(200).json({ userDisplayName: user.userDisplayName, token: token });
}


async function register (req, res) {

    const user = req.body;

    try {

        user.id = crypto.randomBytes(8).toString('hex');
        user.bcrypt = await bcrypt.hash(user.password, 10);
        delete user.password;

        // Insert new user into database
        await sql.insertUser(sql.pool, user);     
        createJwt(user, res);

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

async function login (req, res) {

    const user = req.body;

    try {

        const hash  = await sql.getPasswordHash(sql.pool, user);
        const valid = await bcrypt.compare(user.password, hash);

        if(!valid) throw 'Invalid username or password';

        createJwt(user, res);

    } catch(err) {
        console.log(err)
        res.status(401).json({err: err});
    }

}

function validateToken (req) {

    // Deny access if no cookie present
    let cookies = req.headers.cookie;

    let token = null;
    if(cookies) {

        // Split cookies to array and deny access if no doodle_token is present.
        cookies = cookies.split(';').filter( v => v.includes('doodle_token') );
        if(cookies.length > 0)
            token = cookies[0].split('=')[1].trim(); 
    }

    if(token == null) token = req.query.token;
    if(token == null) return;

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
    if(validateToken(req)) next();
    else res.status(401).send();
}

function auth2 (req, res, next) {
    res.status(401).send();
}


routes.post('/user/register', schema.validateUser, register );
routes.post('/user/guest', schema.validateUser, register );
routes.post('/user/login', schema.validateUser, login );

routes.get('/user/logout', (req, res) => { 
    if(HTTPS_ENABLE) res.cookie('doodle_token=nix; path=/; HttpOnly; secure; max-age=0');
    else res.cookie('doodle_token=nix; path=/; HttpOnly; max-age=0');
    res.status(200).redirect('/');
});

routes.get('/user', auth, (req, res) => res.status(200).json({ userDisplayName: req.body.user.userDisplayName }));


module.exports = {
    routes,
    auth2,
    auth
}