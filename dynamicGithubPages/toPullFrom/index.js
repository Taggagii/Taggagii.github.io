for (let i = 0; i < 100; ++i) {
    process.stdout.write('-');
}
process.stdout.write('\n');



const XMLHttpRequest = require('xhr2');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { get } = require('http');
const { time } = require('console');
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET'],
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

async function checkForUpdate(timeElapsed = 0) {
    let ngrokURL = await getNgrokURL();
    let homeURL = await makeGetRequest('https://taggagii.github.io/myjsonfile.txt', 'text');
    if (homeURL === ngrokURL) {
        console.log(`Connection established: ${timeElapsed}s`);
    } else {
        setTimeout(() => {
            checkForUpdate(timeElapsed + 1);
        }, 1000);
    } 
}

app.get('/ngrok', async (req, res) => {
    res.status(200).send({
        ngrokURL: await getNgrokURL(),
    });
});

app.get('/', (req, res) => {
    res.status(200).send({
        youDidItRight: 'the message that you\'re reading was served by an express api running through ngrok',
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