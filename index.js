var app = require('express')();
var session = require('express-session');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var path = require('path');

const uname = "nguyentamdat"
const pword = 'nopass'
let count = 0

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/admin', function(req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/support', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(__dirname + '/support.html')
    } else {
        res.redirect('/admin');
    }
})

app.post('/admin', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    console.log(username)
    if (username && password) {
        if (uname == username && pword == password) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/support');
        } else {
            res.send('Please use assistant page instead');
        }
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

io.on('connection', function(socket) {
    if (count >= 2) {
        socket.emit('disconnect', 'Please wait')
        socket.conn.close()
    } else {
        console.log("Welcome " + socket.id)
        count++
        socket.on('message', function(msg) {
            socket.broadcast.emit('message', msg);
        });
        socket.on('disconnect', () => {
            count--
            console.log("Bye " + socket.id)
        })
    }
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});