const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const redis = require('./redis');


async function checkCache(req, res, TTL, userSpecific, resolve) {

    for(let label of Object.keys(req.query))
        if(req.query[label] === 'undefined' || req.query[label] === 'null') req.query[label] = '';

    const hash = req.query.hash;
    const user = req.body.user;
    const key = getCachKey(req.method, req.path, req.query, req.body, (user ? user.id: null));

    const sendData = cache => {
        if( !hash || cache.hash !== hash ) res.status(200).json( cache );
        else res.status(200).json({ hash: hash });
    }

    try {

        // Read redis cache and sent back if present.
        const read = await redis.get(key);
        if(read) return sendData(JSON.parse(read));

        // Reslove data for cache when no cache present.
        const params = req.method === 'GET' ? req.query : req.body
        const data = await resolve( params, req.body.user );


        // Create a hash over the data, save both in an object and stringify it for caching.
        const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex'); 
        const object = { hash: hash, result: data };
        const cache = JSON.stringify(object, null, 4);

        // Set the cache value for the key and add a time to live.
        await redis.set(key, cache);
        await redis.expire(key, TTL);

        return sendData(object);

    } catch (err) {
        console.log(err)
        res.status(500).send();
    }

}

// Deletes a cache on update.
async function deleteCache(method, path, query, body, userSpecific) {

    const key = getCachKey(method, path, query ?? {}, body ?? {}, userSpecific);
    await redis.del(key);
}


function getCachKey(method, path, query, body, id) {

    const params = { ...query, ...body };
    delete params.token;
    delete params.hash;
    delete params.user;
    
    const preHash = [path.split('/').join('#'), Object.values(params) ].join('#');
    const hashedParams = crypto.createHash('md5').update(JSON.stringify(preHash)).digest('hex'); 
    const key = (id ? id+':' : '') + method + '#' + hashedParams;

    return key;
}


module.exports = {
    checkCache,
    deleteCache
}