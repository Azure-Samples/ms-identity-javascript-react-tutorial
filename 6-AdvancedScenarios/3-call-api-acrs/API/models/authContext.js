const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/db.json');
const db = lowdb(adapter);

class AuthContext {

    tenantId;
    authContextId;
    authContextDisplayName;
    operation;

    constructor(tenantId, authContextId, authContextDisplayName, operation) {
        this.tenantId = tenantId;
        this.authContextId = authContextId;
        this.authContextDisplayName = authContextDisplayName;
        this.operation = operation;
    }

    static getAuthContexts() {
        return db.get('acrs')
            .value();
    }

    static getAuthContext(authContextId) {
        return db.get('acrs')
        .find({authContextId: authContextId})
        .value();
    }

    static updateAuthContext(authContextId, acrs) {
        db.get('acrs')
            .find({authContextId: authContextId})
            .assign(acrs)
            .write();
    }

    static postAuthContext(newAcrs) {
        db.get('acrs').push(newAcrs).write();
    }

    static deleteAuthContext(authContextObject) {
        const { authContextId,  operation } =  authContextObject;
        db.get('acrs')
            .remove({ authContextId, operation })
            .write();
    }
}

module.exports = AuthContext;