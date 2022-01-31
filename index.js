// Other
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
const fs = require('fs');
const Filter = require('bad-words');
var filter = new Filter();
const { parser, htmlOutput, toHTML } = require('discord-markdown');
let creds = fs.readFileSync('credentials.txt', 'utf8');
//

// Split function because stuff .split()
function split(data, split) {
    data = data.toString();
    let lines = data.split(split);
    return lines;
}
//

// Creds variables
var credlines = split(creds, '\r\n').toString();
var splitcred = split(credlines, ':').toString();
var splitcreds = split(splitcred, ',');
var users = splitcreds.filter(function(item, index) {
    return index % 2 == 0;
});
var password = splitcreds.filter(function(item, index) {
    return index % 2 == 1;
});
//

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/send.svg', (req, res) => {
    res.sendFile(__dirname + '/send.svg');
});
app.get('/svg/bold.svg', (req, res) => {
    res.sendFile(__dirname + '/svg/bold.svg');
});
app.get('/svg/italic.svg', (req, res) => {
    res.sendFile(__dirname + '/svg/italic.svg');
});
app.get('/svg/underline.svg', (req, res) => {
    res.sendFile(__dirname + '/svg/underline.svg');
});
app.get('/svg/size.svg', (req, res) => {
    res.sendFile(__dirname + '/svg/size.svg');
});
app.get('/svg/strikethrough.svg', (req, res) => {
    res.sendFile(__dirname + '/svg/strikethrough.svg');
});
app.get('/svg/ham.svg', (req, res) => {
    res.sendFile(__dirname + '/svg/ham.svg');
});

// Login
io.on('connection', (socket) => {
    socket.on('login', creds => {
        var split = creds.split(':');
        var user = split[0];
        var pass = split[1];
        var index = users.indexOf(user);
        if (index > -1) {
            if (password[index] === pass) {
                socket.emit('login', split[0]);
            }
        }
    });
});
//

// History requests
io.on('connection', (socket) => {
    socket.on('history request', name => {
        fs.readFile('chatHistory.txt', 'utf8', function(err, data) {
            if (err) throw err;
            var lines = data.split('\n');
            socket.emit('history', lines, name);
        });
    });
});
//

// Credential checking
io.on('connection', (socket) => {
    socket.on('checkcred', name => {
        //check if name is in users array
        var index = users.indexOf(name);
        if (index > -1) {
            socket.emit('checkcred', 'n');
        } else {
            socket.emit('checkcred', 'y');
        }
    });
});
//

// Chat distributing
io.on('connection', (socket) => {
    socket.on('chat message', msg => {
        var m = msg;
        let raw = m + `\r\n`;
        writeHistory(raw);
        var mesg = toHTML(m);
        var mes = filter.clean(mesg);
        console.log(mes);
        io.emit('chat message', mes);
    });
});
//

// Register writing
io.on('connection', (socket) => {
    socket.on('register', name => {
        let e = name + '\r\n';
        writeCreds(e);
        console.log('New user:' + name);
    });
});
//

// Register name checking
io.on('connection', (socket) => {
    socket.on('name check', name => {
        // loop through the users array and check if name is in it
        var index = users.indexOf(name);
        if (index > -1) {
            socket.emit('name', 1);
        } else {
            socket.emit('name', 0);
        }
    });
});
//

// Open port
http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
//

// History writing
function writeHistory(chat) {
    fs.appendFile("chatHistory.txt", chat, 'utf8', function(err) {
        if (err) {
            console.log("An error occured while writing string literal to File.");
            return console.log(err);
        }
    });
}
//

// Credential writing
function writeCreds(cred) {
    fs.appendFile("credentials.txt", cred, 'utf8', function(err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        var splitcred = split(cred, ':').toString();
        var splitcreds = split(splitcred, ',');
        var users1 = splitcreds.filter(function(item, index) {
            return index % 2 == 0;
        });
        var password1 = splitcreds.filter(function(item, index) {
            return index % 2 == 1;
        });
        users = users + users1;
        password = password + password1;
        creds = creds + cred;
        console.log(creds);
    });
}
//