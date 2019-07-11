const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./models/User');

const Router = express.Router();
const PORT = 4321;
const headers = { 'Content-Type': 'text/html; charset=utf-8' };
const app = express();

const checkAuth = (req, res, next) => {
    if (req.session.auth == 'ok') {
        next();
    } else {
        res.redirect('/login');
    }
}

Router
    .route('/')
    .get((req, res) => res.end('Привет мир!'));

app
    .set('view engine', 'pug')
    .set('x-powered-by', false)
    .use(express.static('.'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(session({ secret: 'mysecret', resave: true, saveUninitialized: true }))
    .use((req, res, next) => {
        res.status(200).set(headers);
        next();
    })
    .use('/', Router)
    .get('/login', (req, res) => res.render('login'))
    .post('/login/check/', async (req, res) => {
        const login = req.body.login;
        try {
            const user = await User.findOne({ login });
            if (user) {
                if (user.password == req.body.password) {
                    req.session.auth = 'ok';
                    req.session.login = login;
                    res.send('Вы авторизированы, доступен закрытый маршрут.');
                }
            }
            res.send('Неверный логин или пароль');
        } catch(err) {
            console.log(err);
        }
    })
    .get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) console.log(err);
        });
        res.send('Вы успешно разлогинились');
    })
    .get('/profile', checkAuth, (req, res) => res.send(req.session.login))
    .get('/users', async (req, res) => {
        const users = await User.find();
        const answer = users.map(item =>{
            return {login: item.login, password: item.password}
        });
        res.render('users', {users: answer});
    })
    .use((req, res) => res.status(404).end('Страница не найдена!'))
    .use((err, req, res, next) => res.status(500).end('Ошибка: ' + err))
const server = http.Server(app);
server.listen(process.env.PORT || PORT, () => console.log(process.pid));
