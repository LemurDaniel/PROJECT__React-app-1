// Load Modules //
const fs = require('fs');
const cors = require('cors'); 
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');

// load custom modules
const sql = require('./modules_private/sql_calls');
const schema = require('./modules_private/joi_models');
const { auth, route: auth_routes } = require('./modules_private/user_auth');
const { routes: image_routes, helper } = require('./modules_private/image_data');
const { routes: task_routes } = require('./modules_private/tasks');
const HTML = helper.HTML;

// Get environment variables
const HTTPS_ENABLE = (process.env.HTTPS_ENABLE == 'true' ? true:false);
const SSL_KEY = process.env.SSL_KEY || process.env['ssl.key.pem'];
const SSL_CERT = process.env.SSL_CERT || process.env['ssl.cert.pem'];
const PORT = process.env.PORT || (HTTPS_ENABLE ? 443:80);


//Create Server//
const app = express();
app.use(cors())
// Make everything in /public  publicly accessible
app.use(express.static('/var/project/src/public'));
// Use bodyParser to automatically convert json body to object
app.use(bodyParser.json({ limit: '5mb' }))
// Use routes from authorization module and image module
app.use(auth_routes);
app.use(image_routes);
app.use(task_routes);
// Send nicley formatted Json
app.set('json spaces', 2)


// Create http or https server depending on environment Variable
var server;
if(!HTTPS_ENABLE)
    server = http.createServer(app);
else {
    server = https.createServer({
        key: SSL_KEY,
        cert: SSL_CERT
    }, app);
}

// Initialize DB
var tries = 0;
const MAX_TRIES = 30;
async function check_for_connection() {

    if(++tries > MAX_TRIES) return console.log('Couldn\'t connect to database')

    try {
        const file = helper.DOODLES + process.env.SQL_TABLE_NAME + '_EXISTS.info';
        if (!fs.existsSync(file)) {
            await sql.init_Database();
            fs.writeFileSync(file, '');
        };

        server.listen(PORT);
        console.log('Connection Successfull, listening now on Port: '+PORT);
    } catch(err) {
        console.log(err)
        console.log('Waiting for database connection | Trie: '+tries+'/'+MAX_TRIES+'  - CODE: '+err.code);
        setTimeout(() => check_for_connection(), 2000);
    }

}
check_for_connection();



// GET //
app.get('/', auth, (req,res) => res.sendFile(HTML('index')));
app.get('/draw', auth, (req,res) => res.sendFile(HTML('draw')));
app.get('/space', auth, (req,res) => res.sendFile(HTML('asteriods_game')));
app.get('/credits', (req,res) =>  res.sendFile(HTML('credits')));
app.get('/rocket', auth, (req,res) => res.sendFile(HTML('rocket_game')));
app.get('/draw/gallery', auth, (req, res) => res.sendFile(HTML('gallery')));
app.get('/translation', auth, (req,res) => res.sendFile(helper.TRANSLATION));


// Only for testing, shows all certificates, passwords and other environment variables//
app.get('/info', auth, (req,res) =>  res.json(process.env) );


// Catch 404's and send user to the 404 page //
app.use((req, res, next) => res.status(404).sendFile(HTML('codepen_template/404')));


// If https is enabled then create a second http server that automatically redirects all traffic to https //
if(HTTPS_ENABLE) {
    const app_http = express();
    const http_server = http.createServer(app_http);
    http_server.listen(80);

    app_http.use((req, res, next) => {
        if (res.secure) return next();
        else if(PORT == 443) return res.redirect('https://' + req.headers.host + req.url);
        else return res.redirect('https://' + req.headers.host + ':'+ PORT + req.url);
    })
}

