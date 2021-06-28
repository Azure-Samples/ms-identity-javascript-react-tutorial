const mongoose = require('mongoose');
const User = require('./user.model');

let connected = false;
let connection = null;

const mongooseConfig = {
    url: process.env.MONGODB_URL,
    options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }
}

const connect = async () => {
    try {
        if (!connected && mongooseConfig && mongooseConfig.url && mongooseConfig.options) {

            // connect to DB
            connection = await mongoose.connect(mongooseConfig.url, mongooseConfig.options);
            connected = true;
            return connected;

        } else if (connected) {

            // already connected to DB
            console.log("Mongoose already connected");
            return connected;
        }
        else {
            // can't connect to DB
            throw Error("Mongoose URL needs to be added to Config settings as MONGODB_URL");
        }
    } catch (err) {
        console.log(`Mongoose connection error: ${err}`);
        throw Error({ name: "Sample-Mongoose", message: "connection error -" + error, status: 500 });
    }
}
const disconnect = () => {
    connection.disconnect();
}

const isConnected = () => {
    return connected;
}

const queryUsers = async (filter, options) => {
    const users = await User.paginate(filter, options);
    return users;
}

const getUserByEmail = async (email) => {
    if (email) {
        email = email.toLowerCase();
    }
    return await User.findOne({ email });
}
const upsertByEmail = async (email, mongodbUser) => {

    const query = { 'email': email };

    const tempUser = await User.findOneAndUpdate(query, mongodbUser, { upsert: true, new: true });
    return tempUser;

}
const getUserById = async (id) => {
    return await User.findById(id);
};
const deleteUserById = async (userId) => {

    const tempUser = await getUserById(userId);
    if (!tempUser) {
        throw new Error('User not found');
    }
    await User.remove();
    return tempUser;
}

module.exports = {
    connect,
    disconnect,
    isConnected,
    queryUsers,
    getUserById,
    getUserByEmail,
    upsertByEmail,
    deleteUserById
}
