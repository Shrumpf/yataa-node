
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const pool = mysql.createPool({
    host: '',
    user: '',
    database: '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(cors());
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.sendStatus(200);
});

app.get('/todos/', async function (req, res) {
    const result = await pool.query('SELECT * FROM todos')
    res.send(result[0]);
});

app.get('/todos/:id', async function (req, res) {
    const result = await pool.query('SELECT * FROM todos WHERE Id = ?', [req.params.id])
    res.send(result[0][0]);
})

app.post('/todos/', async function (req, res) {
    await pool.query('INSERT INTO todos (UserId, Title, Content) VALUES (1, ?, ?)', [req.body.Title, req.body.Content])
    res.sendStatus(200);
    io.emit('pushedTodo', { data: req.body });
});

app.put('/todos/:id', async function (req, res) {
    await pool.query('UPDATE todos SET Title = ?, Content = ?', [req.body.Title, req.body.Content])
    res.sendStatus(200);
});

app.delete('/todos/:id', async function (req, res) {
    await pool.query('DELETE FROM todos WHERE Id = ?', [req.params.id])
    res.sendStatus(200);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('clicked', () => {
        console.log("a user clicked a button");
    });
    io.emit('customEvent', { customData: true });
});

http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

