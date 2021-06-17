const fs = require('fs');
const crypto = require('crypto');


// Constants
const PATH = '/var/project/src/public/';
const CACHE = PATH+'cache/';
const CACHE_TTL = process.env.CACHE_TTL || 10; //seconds


// create chache folder if non-existant
if(!fs.existsSync(CACHE)) fs.mkdirSync(CACHE);


async function checkCache(req, res, TTL, userSpecific, resolve) {

    for(let label of Object.keys(req.query))
        if(req.query[label] === 'undefined' || req.query[label] === 'null') req.query[label] = '';

    const hash = req.query.hash;
    const key = getCachKey(req.method, req.path, req.query, req.body, userSpecific);

    const sendData = cache => {
        if( !hash || cache.hash !== hash ) res.status(200).json( cache );
        else res.status(200).json({ hash: hash });
    }

    try {

        const read = readCache(key);
        if(read) return sendData(read);

        const params = req.method === 'GET' ? req.query : req.body
        const data = await resolve( params, req.body.user );
        const written = writeCache(key, data, req, TTL ?? CACHE_TTL, userSpecific);
        return sendData(written);

    } catch (err) {
        console.log(err)
        res.status(500).send();
    }

}

async function deleteCache(method, path, query, body, userSpecific) {

    const key = getCachKey(method, path, query ?? {}, body ?? {}, userSpecific);
    console.log('DELETE   ' +key)
    fs.unlink(key, err => {});

}


function getCachKey(method, path, query, body, userSpecific) {

    const params = { ...query, ...body };
    delete params.token;
    delete params.hash;
    delete params.user;

    let folder = CACHE + (userSpecific ? body.user.id+'/' : '')
    if(!fs.existsSync(folder)) fs.mkdirSync(folder);
    
    const preHash = [path.split('/').join('#'), Object.values(params) ].join('#');
    const hashedParams = crypto.createHash('md5').update(JSON.stringify(preHash)).digest('hex'); 
    const key = folder + method + '#' + hashedParams + '.json';


    console.log(params)
    console.log(key)

    return key;
}

// Read cache from folder
// Each search request consisting of 'image class', 'image name' and 'user name' is encoded in one filename
function readCache(key) {

    // read existing cache and check if it's expired
    if(!fs.existsSync(key)) return null;
    cachedVal = JSON.parse(fs.readFileSync(key));
    if (cachedVal && cachedVal.exp > Date.now()) return cachedVal.content;

}

// Write to cache file in folder
// conditions like one container writing shortly after another container has read its content
// which causes it to therefore operate on stale data and then search the database again
// can be ignored. Regardless of that the cache file will always be overwritten with a valid entry.
function writeCache(key, data, req, TTL, userSpecific) {

    // Hash identifies changes in result
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex'); 
    const object = { hash: hash, result: data };
    const expiration = Date.now()+(TTL*1000);

    const temp = {
        exp: expiration, 
        user: req.body.user.userDisplayName,
        query: req.query, 
        body: { ...req.body, user: null }, 
        content: object
    }

    delete temp.body.user;
    if(!userSpecific) delete temp.user;
    
    const cache = JSON.stringify(temp, null, 4);

    fs.writeFileSync(key, cache);

    return object;

}

module.exports = {
    checkCache,
    deleteCache
}