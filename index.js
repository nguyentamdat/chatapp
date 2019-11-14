var app = require('express')();
var session = require('express-session');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var net = require('net');

var sk = net.createConnection(6000, '192.168.0.105', () => {
    console.log("Connect successful")
    sk.write(`LOGIN guest ${sk.localPort}\n`)
})

var client;

sk.setEncoding("utf8")

sk.on("data", (data) => {
    var data = data.toString().replace("\r\n", "")
    console.log(`Receive data: ${data.toString()}`)
    var mes = data.toString().split(" ")
    console.log(mes)
    if (mes[0] == 'MSG') { io.to(client).emit("message", data.replace("MSG ", "")) }
})

sk.on("timeout", () => {
    console.log("Client timeout")
})

sk.on("close", () => {
    console.log("On close")
})

sk.on("drain", () => {
    console.log("Drain")
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    sk.write("CHATADMIN\n")
})

io.on('connection', function(socket) {
    client = socket.id
    socket.on('message', function(msg) {
        sk.write(`MSG admin ${msg}\n`)
    });
    socket.on('disconnect', () => {
        console.log("Bye " + socket.id)
    })
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});