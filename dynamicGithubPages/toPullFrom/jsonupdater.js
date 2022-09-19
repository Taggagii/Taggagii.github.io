const XMLHttpRequest = require('xhr2');
const fs = require('fs');


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
                reject(JSON.stringify(xhr.response.tunnels))
            }
        };
        xhr.onerror = (err) => {
            reject();
        };
        
        xhr.send();
    });
}

async function logNgrokURL() {
    let url = await getNgrokURL().catch(() => {
        console.error('could not find endpoint');
    });
    if (url) {
        url = url.replace(/https?/, 'https');
        console.log(`ngrok url: ${url}`);
        fs.writeFile('myjsonfile.txt', url, 'utf-8', () => {});
    } else {
        setTimeout(() => {
            logNgrokURL();
        }, 1000);
    }
}

logNgrokURL();