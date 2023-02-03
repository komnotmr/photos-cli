import {exit, env} from 'process';
import {Console} from './src/console.mjs';
import {Store} from './src/store.mjs';
import {VK} from './src/vk.mjs';
import FormData from 'form-data';
import * as fs from 'fs';
import * as CliProgress from 'cli-progress';

const initSession = async () => {
    const exitIfError = (session) => {
        if (!Object.prototype.hasOwnProperty.call(session, 'access_token') || !session.access_token) {
            console.error(`session in ${Store.sessionPath} doesnot contain 'access_token' field`);
            exit(1);
        }
    };

    const session = Store.load();
    if (session) {
        exitIfError(session);
        return session;
    }
    
    let wasEnvError = false;
    if (!Object.prototype.hasOwnProperty.call(env, 'CLIENT_ID')) {
        console.error('env variable CLIENT_ID undefined');
        wasEnvError = true;
    }

    if (!Object.prototype.hasOwnProperty.call(env, 'CLIENT_SECRET')) {
        console.error('env variable CLIENT_SECRET undefined');
        wasEnvError = true;
    }

    if (wasEnvError)
        exit(1);

    console.log(VK.getCode(env.CLIENT_ID));
    const code = await Console.prompt('input code:');
    console.log(VK.getAccessToken(env.CLIENT_ID, env.CLIENT_SECRET, code));
    const accessToken = await Console.prompt('input access_token:');
    const newSession = {
        access_token: accessToken,
        code: code
    };
    Store.save(newSession);
    exitIfError(newSession);
    return newSession;
};

const initUser = async (api, session) => {
    const userId = await Console.prompt('input user id:');
    session.user = (await api.getUser(userId));
    Store.save(session);
    return session.user;
};

const userInput = async (vk, session) => {
    const userGroups = await vk.getUserGroups(session.user.id);
    Console.printTable(userGroups.reverse());
    session.group_id = await Console.promptOptional('input group id', session.group_id);
    Store.save(session);
    const groupAlbums = await vk.getGroupAlbums(`-${session.group_id}`);
    Console.printTable(groupAlbums.reverse());
    session.album_id = await Console.promptOptional('input album id', session.album_id);
    Store.save(session);
    session.path_to_photos = await Console.promptOptional('input path to photos', session.path_to_photos);
    Store.save(session);
    session.path_to_comment_file = await Console.promptOptional('input path to comment file', session.path_to_comment_file);
    Store.save(session);
};

const loadPhotos = async (vk, session) => {
    const getPhotosList = async (path) => {
        const p = new Promise((resolve) => {
            const result = [];
            fs.readdirSync(path).forEach(file => {
                result.push(`${path}/${file}`);
            });
            resolve(result);
        });
        return p;
    };

    const readPhoto = path => {
        return fs.createReadStream(path);
    };

    const readCommentFile = path => {
        let data = '';
        try {
            data = fs.readFileSync(path, 'utf-8');
        } catch (e) {
            console.log(`file ${path} not found !!!, comment is empty`);
        }
        return data;
    }

    const photosList = await getPhotosList(session.path_to_photos);
    const chunkSize = 5;
    const comment = readCommentFile(session.path_to_comment_file);
    if (comment)
        console.log(comment);

    const uploadServerUrl = await vk.getUploadServer(session.group_id, session.album_id);
    console.log(`upload server url: ${uploadServerUrl}`);
    const bar = new CliProgress.SingleBar({}, CliProgress.Presets.shades_classic);
    bar.start(photosList.length, 0);
        for (let i = 0; i < photosList.length; i++) {
            const formData = new FormData()
            for (let j = i, count = 0; count < chunkSize && j < photosList.length; j++) {
                formData.append(`file${count++}`, readPhoto(photosList[i]));
                i++;
                bar.update(i);
            }
            i--;
            try {
                const response = await vk.uploadPhotoToServer(uploadServerUrl, formData);
                await vk.savePhotosToServer(
                    response.aid,
                    response.gid,
                    response.server,
                    response.photos_list,
                    response.hash,
                    comment
                );
            } catch (err) {
                console.error(err);
                exit(1);
            }

        }
        bar.stop()
};

const main = async () => {

    const session = await initSession();
    if (!Object.prototype.hasOwnProperty.call(session, 'access_token')) {
        console.error(`session in ${Store.sessionPath} doesnot contain 'access_token' field`);
        exit(1);
    }

    const vk = new VK(session.access_token);

    if (!Object.prototype.hasOwnProperty.call(session, 'user')) {
        await initUser(vk, session);
    }

    await userInput(vk, session);
    await loadPhotos(vk, session);

    exit(0);
};

await main();

exit(0);
