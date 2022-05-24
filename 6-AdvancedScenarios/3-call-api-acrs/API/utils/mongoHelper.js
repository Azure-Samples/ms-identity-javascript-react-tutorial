const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;

exports.mongoConnect = (callback) => {
    MongoClient.connect(process.env.DB_CONNECTION_STRING)
        .then(client => {
            db = client.db(process.env.DB_NAME);
            callback();
        }).catch(err => {
            console.log(err);
        })
};

exports.getDB = () => {
    if (db) {
        return db;
    } else {
        throw err;
    }
}
