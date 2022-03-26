// Load Modules //
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const http = require('http');
const https = require('https');
const express = require('express');

// load custom modules
const sql = require('./modules/sqlCalls');
const { routes: task_routes } = require('./modules/tasks');
const { routes: image_routes } = require('./modules/imageData');
const { routes: auth_routes, auth } = require('./modules/userAuth');


// Get environment variables
const HTTPS_ENABLE = (process.env.HTTPS_ENABLE == 'true' ? true : false);
const PORT = process.env.PORT || (HTTPS_ENABLE ? 443 : 80);
const SSL = {
    key: HTTPS_ENABLE ? fs.readFileSync(path.join(__dirname, process.env.SSL_KEY)).toString() : null,
    cert: HTTPS_ENABLE ? fs.readFileSync(path.join(__dirname, process.env.SSL_CERT)).toString() : null,
};


const soundEffects = {};
fs.readdirSync(path.join(__dirname, "public/assets/sounds")).
    filter(item => item.split(".").pop() === "mp3").
    forEach(item => soundEffects[item.split(".")[0]] = path.join("/assets/sounds", item));
fs.writeFileSync(path.join(__dirname, "public/assets/sounds", "soundeffects.json"), JSON.stringify(soundEffects, null, 4));

//Create Server//
const app = express();
app.use(cors())
app.set('json spaces', 2)   // Send nicley formatted Json
app.use(express.json({ limit: '5mb' }))

// Make everything in /public  publicly accessible
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build')));

// Use routes from authorization module and image module
app.use(auth_routes);
app.use(image_routes);
app.use(task_routes);


app.use('/', (req, res, next) => {
    if (req.path === '/' || req.path === '/index')
        return res.sendFile(path.join(__dirname, 'build', 'index.html'));

    res.set('X-Robots-Tag', 'noindex');
    next();
});

app.use('/game', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
app.use('/drawing', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
app.use('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
app.use('/taskTracker', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
app.use('/impressum', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

// Stuff from old project still lef in.
app.get('/space', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'asteriods_game.html')));
app.get('/rocket', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'rocket_game.html')));
app.get('/credits', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'credits.html')));



// Catch 404's and send user to the 404 page //
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'codepenTemplate', '404.html')));


// Initalize database and create Server.

sql.initDatabase().then(() => {

    console.log('Database initialized');

    if (HTTPS_ENABLE) {
        https.createServer(SSL, app).listen(PORT);
        http.createServer((req, res) => {
            const header = { 'Location': `https://${req.headers.host + req.url}` };
            res.writeHead(302, header).end();
        }).listen(80);


        console.log('HTTP to HTTPS redirection now listening on port 80')
        console.log('HTTPS Server now listening on Port: ' + PORT);

    } else {
        http.createServer(app).listen(PORT);
        console.log('HTTP Server now listening on Port: ' + PORT);
    }

}).catch(console.log);