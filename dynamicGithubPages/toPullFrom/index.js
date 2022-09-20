for (let i = 0; i < 100; ++i) {
    process.stdout.write('-');
}
process.stdout.write('\n');

const XMLHttpRequest = require('xhr2');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;


var bodyParser = require('body-parser')

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(cors({
    origin: '*',
}));

// make getrequest to http://localhost:4040/api/tunnels to get running ngrok tunnels
let githubUpdated = false;

function makeGetRequest(url, type = 'json') {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = type;
        xhr.open('GET', url);
        xhr.onload = () => {
            // let myResponse = xhr.response.tunnels.filter(host => host.config.addr === 'http://localhost:8080')[0]?.public_url ?? false;
            resolve(xhr.response);
        };
        xhr.send();
    });
}

function getNgrokURL() {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', 'http://localhost:4040/api/tunnels');
        xhr.onload = () => {
            // let myResponse = xhr.response.tunnels.filter(host => host.config.addr === 'http://localhost:8080')[0]?.public_url ?? false;
            let myResponse = xhr.response.tunnels[0]?.public_url ?? false;
            if (myResponse) {
                resolve(myResponse);
            } else {
                resolve(JSON.stringify(xhr.response.tunnels))
            }
        };
        xhr.send();
    });
}

let ngrokURL = '';
async function checkForUpdate(timeElapsed = 0) {
    if (ngrokURL === '') {
        ngrokURL = await getNgrokURL();
        ngrokURL = ngrokURL.replace(/https?:\/\//, '');
    }
    let homeURL = await makeGetRequest('https://taggagii.github.io/myjsonfile.txt', 'text');
    homeURL = homeURL.replace(/https?:\/\//, '');
    if (homeURL == ngrokURL) {
        console.log(`Connection established: ${timeElapsed}s`);
    } else {
        setTimeout(() => {
            checkForUpdate(timeElapsed + 1);
        }, 1000);
    } 
}

app.get('/ngrok', async (req, res) => {
    console.log('post request made', req.body);
    res.status(200).send({
        ngrokURL: await getNgrokURL(),
    });
});

app.get('/', (req, res) => {
    res.status(200).send({
        youDidItRight: `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4vw; font-family: Arial;">This page is cool because everything about it was styled through an API, to prove this, here's a random number: ${Math.random()} </br>Try refreshing the page.</div>`,
        // youDidItRight: `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4vw; font-family: Arial;">${Math.random()}</div>`,
        // youDidItRight: `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4vw; font-family: Arial;">hello there little man: ${Math.random()}</div>`,
    });
});

app.post('/', (req, res) => {
    console.log('post request made', req.body);
    res.status(201).send({
        postResponse: req.body.testing,
        // youDidItRight: `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4vw; font-family: Arial;">${Math.random()}</div>`,
        // youDidItRight: `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4vw; font-family: Arial;">hello there little man: ${Math.random()}</div>`,
    });
});


app.listen(
    PORT, 
    () => {
        console.log(`API is listening on: http://localhost:${PORT}`);
        console.log('Checking for connection to GitHub...');
        checkForUpdate();
    }
);