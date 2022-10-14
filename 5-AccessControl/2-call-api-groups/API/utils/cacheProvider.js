/**
 * Pass below an instance of the cache client of your choice
 * that implements SET, GET, HAS and DELETE methods.
 * @param {Object} provider 
 * @returns 
 */
module.exports = (provider) => {

    /**
     * Sets a key-value pair in the cache.
     * @param {String} key 
     * @param {any} item 
     */
    const set = (key, item) => {
        provider.set(key, item);
        console.log(`Cache set: ${key} - ${item}`);
    }

    const get = (key) => {
        return provider.get(key);
    }

    const has = (key) => {
        console.log('Cache hit for key: ' + key);
        return provider.has(key);
    }

    const del = (key) => {
        provider.del(key);
        console.log('Cache deleted for key: ' + key);
    }

    return {
        get,
        set,
        has,
        del
    }
}