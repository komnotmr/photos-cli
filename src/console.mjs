import readline from 'readline';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

import Table from 'cli-table';

export class Console {
    static prompt (msg) {
        return new Promise((resolve) => rl.question(msg, resolve))
    }

    static printTable (objArray) {
        const headers = Object.entries(objArray[0]).map(([key, _]) => key);
        const table = new Table({head: headers});
        objArray.forEach(elem => table.push(
            Object.entries(elem).map(([_, v]) => v)
        ));
        console.log(table.toString());
    }

    static async promptOptional (message, defaultValue) {
        console.log(defaultValue)
        const value = await Console.prompt(
            defaultValue
                ? `${message} (press enter for ${defaultValue}):`
                : `${message}:`
        );
        return value || defaultValue;
    }
}
