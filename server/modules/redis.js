const redis = require('redis');


// Constants
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;


const client = redis.createClient(REDIS_PORT, REDIS_HOST, {no_ready_check: true});
client.on('error', error => console.error('Error Connecting to the Redis Cluster', error));
client.on('connect', () => console.log('Successfully connected to the Redis cluster!'));


// Wrapping some redis methods in promises.
exp = {

    get(key) {

        return new Promise( (resolve, reject) => {
            client.get(key, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            })
        })
    },

    del(key) {

        return new Promise( (resolve, reject) => {
            client.del(key, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            })
        })
    },

    set(key, value) {

        return new Promise( (resolve, reject) => {
            client.set(key, value, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            })
        })

    },

    expire(key, ttl) {

        return new Promise( (resolve, reject) => {
            client.expire(key, ttl, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            })
        })
    }
}


module.exports = exp;