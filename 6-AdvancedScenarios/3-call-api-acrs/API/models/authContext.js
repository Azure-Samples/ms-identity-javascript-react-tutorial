const mongoHelper = require('../utils/mongoHelper');

class AuthContext {

    _id;
    tenantId;
    authContextId;
    authContextDisplayName;
    operation;

    constructor(id, tenantId, authContextId, authContextDisplayName, operation) {
        this._id = id;
        this.tenantId = tenantId;
        this.authContextId = authContextId;
        this.authContextDisplayName = authContextDisplayName;
        this.operation = operation;
    }

    static async getAuthContexts() {
        const data = await mongoHelper.getDB().collection('acrs').find().toArray();
        return data;
    }

    static async postAuthContext(newAcrs) {
        const data = await mongoHelper.getDB().collection('acrs').insertOne(newAcrs);
        return data;
    }

    static async deleteAuthContext(id) {
        return (await mongoHelper.getDB().collection('acrs').deleteOne({ _id: id }));
    }
}

module.exports = AuthContext;
