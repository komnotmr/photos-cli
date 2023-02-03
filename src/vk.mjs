import {generateUrl} from './misc.mjs';
import fetch from 'node-fetch';

export class VK {

    static getCode (clientId) {
        return generateUrl('https://oauth.vk.com/authorize', {
            client_id: clientId,
            scope: 0
                | (1 << 2) // photos
                | (1 << 18) // groups
                | (1 << 16) ,// offline
            display: 'page',
            response_type: 'code'
        });
    }

    static getAccessToken (clientId, clientSecret, code) {
        return generateUrl('https://oauth.vk.com/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
        });
    }
      
    constructor (accessToken) {
        this.accessToken_ = accessToken;
        this.apiUrl_ = 'https://api.vk.com/method/';
        this.apiVersion_ = '5.131';
    }

    async apiRequestGet (method, params) {
        const url = generateUrl(`${this.apiUrl_}${method}`, {
            ...params,
            access_token: this.accessToken_,
            v: this.apiVersion_
        });

        const request = await fetch(url);
        const response = await request.json();

        return response;
    }

    async apiRequestPost (url, body, params={}) {
        const request = await fetch(
            generateUrl(url, {
                ...params,
                access_token: this.accessToken_,
                v: this.apiVersion_
            }),
            {
                method: 'POST',
                body: body
            }
        );
        return request.json();
    }

    async getUser (userId) {
        return (await this.apiRequestGet('users.get', {user_ids: userId})).response[0];
    }

    async getUserGroups (userId) {
        return (await this.apiRequestGet('groups.get', {user_id: userId, extended: 1})).response.items
            .map(elem => ({id: elem.id, name: elem.name}));
    }

    async getGroupAlbums (groupId) {
        return (await this.apiRequestGet('photos.getAlbums', {owner_id: groupId})).response.items
            .map(elem => ({id: elem.id, title: elem.title}));
    }

    async getUploadServer (groupId, albumId) {
        return (await this.apiRequestGet('photos.getUploadServer', {group_id: groupId, album_id: albumId})).response.upload_url;
    }

    async uploadPhotoToServer (uploadServerUrl, body) {
        return (await this.apiRequestPost(uploadServerUrl, body));
    }

    async savePhotosToServer (albumId, groupId, serverId, photosList, hash, caption) {
        return (await this.apiRequestGet('photos.save', {
            album_id: albumId, 
            group_id: groupId,
            server: serverId,
            photos_list: photosList,
            hash: hash,
            caption: encodeURIComponent(caption)
        }));
    }
}
