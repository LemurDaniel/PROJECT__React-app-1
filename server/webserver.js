// Load Modules //
const fs = require('fs');
const path = require('path');
// const cors = require('cors'); 
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');

// load custom modules
const sql = require('./modules/sqlCalls');
const { routes: task_routes } = require('./modules/tasks');
const { routes: image_routes } = require('./modules/imageData');
const { routes: auth_routes, auth } = require('./modules/userAuth');


// Get environment variables
const HTTPS_ENABLE = (process.env.HTTPS_ENABLE == 'true' ? true:false);
const SSL_KEY = process.env.SSL_KEY || process.env['ssl.key.pem'];
const SSL_CERT = process.env.SSL_CERT || process.env['ssl.cert.pem'];
const PORT = process.env.PORT || (HTTPS_ENABLE ? 443:80);


//Create Server//
const app = express();
// app.use(cors())

// Make everything in /public  publicly accessible
app.use( express.static(path.join(__dirname, 'public')) );
app.use( express.static(path.join(__dirname, 'build')) );

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
async function checkForConnection() {

    if(++tries > MAX_TRIES) return console.log('Couldn\'t connect to database')

    try {
        const file = path.join(__dirname, 'public', 'doodles', process.env.SQL_TABLE_NAME + '_EXISTS.info');
        if (!fs.existsSync(file)) {
            await sql.initDatabase();
            fs.writeFileSync(file, '');
        };

        server.listen(PORT);
        console.log('Connection Successfull, listening now on Port: '+PORT);
    } catch(err) {
        console.log(err)
        console.log('Waiting for database connection | Trie: '+tries+'/'+MAX_TRIES+'  - CODE: '+err.code);
        setTimeout(() => checkForConnection(), 2000);
    }

}
checkForConnection();


app.use( '/game', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')) );
app.use( '/drawing', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')) );
app.use( '/gallery', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')) );
app.use( '/taskTracker', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')) );
app.use( '/impressum', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')) );

// Stuff from old project still lef in.
app.get('/space', (req,res) => res.sendFile(path.join(__dirname, 'public', 'html', 'asteriods_game.html')) );
app.get('/rocket', (req,res) => res.sendFile(path.join(__dirname, 'public', 'html', 'rocket_game.html')) );
app.get('/credits', (req,res) => res.sendFile(path.join(__dirname, 'public', 'html', 'credits.html')) );



// Catch 404's and send user to the 404 page //
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'codepenTemplate', '404.html')) );

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

