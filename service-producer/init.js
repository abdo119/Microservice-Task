// docker-entrypoint-initdb.d/init.js
db = db.getSiblingDB('eventdb');
db.createUser({
    user: 'root',
    pwd: 'example',
    roles: [{ role: 'readWrite', db: 'eventdb' }]
});