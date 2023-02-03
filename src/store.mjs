import * as fs from 'fs';

export class Store {

    static sessionPath = 'session.json';

    static cache__ = null;

    static load () {
        if (Store.cache__)
            return Store.cache__;
        let data = null;
        try {
            data = fs.readFileSync(Store.sessionPath);
        } catch (e) {
            console.error('session.json not found creating');
            fs.writeFileSync(Store.sessionPath, '')
        }
        
        if (!data)
            return null;

        try {
            return JSON.parse(data);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    static save (session) {
        Store.cache__ = session;
        return fs.writeFileSync(Store.sessionPath, JSON.stringify(session));
    }

}