const fs = require('fs');
const crypto = require('crypto');


// Constants
const PATH = '/var/project/src/public/';
const CACHE = PATH+'/cache/';
const TTL = process.env.CACHE_TTL || 10; //seconds


// create chache folder if non-existant
if(!fs.existsSync(CACHE)) fs.mkdirSync(CACHE);


async function checkCache(req, res, resolve) {

    const hash = req.query.hash;
    const key = getCachKey(req);

    const sendData = cache => {
        if( !hash || cache.hash !== hash ) res.status(200).json( cache );
        else res.status(200).json({ hash: hash });
    }

    try {

        const read = readCache(key);
        if(read) return sendData(read);

        const data = await resolve( req.method === 'GET' ? req.query : req.body );
        const written = writeCache(key, data);
        return sendData(written);

    } catch (err) {
        console.log(err)
        res.status(500).send();
    }

}


function getCachKey(req) {

    let params;
    if(req.method !== 'GET') params = Object.values({ ...req.query, hash: null }); 
    else params = Object.values(req.body); 
    
    const preHash = [req.path.split('/').join('#'), ...params ].join('#');
    const hashedParams = crypto.createHash('md5').update(JSON.stringify(preHash)).digest('hex'); 
    const key = CACHE + req.method + '#' + hashedParams + '.json';

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
function writeCache(key, data) {

    // Hash identifies changes in result
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('base64'); 
    const object = { hash: hash, data: data };
    const expiration = Date.now()+(TTL*1000);

    const cache = JSON.stringify({ exp: expiration, content: object }, null, 4);

    fs.writeFileSync(key, cache);

    return object;

}

module.exports = {
    checkCache
}