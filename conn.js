const m = require('mongoose');

async function getConnect() {
    await m.connect('mongodb://reader:123321@kodaktor.ru/readusers', { useNewUrlParser: true });
}
getConnect().catch(err => console.error('Невозможно соединиться с базой данных.'));
module.exports = m;