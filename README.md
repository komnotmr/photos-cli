# photos-cli
CLI utility for upload photos to group album

## Table of contents

* [Install](#install)
* [Usage](#usage)

## Install

1. Install [nodejs and nmp](https://nodejs.org/en/)
2. Create standalone [VK app](https://dev.vk.com/)
3. Save _client_secret_ and _client_id_ from https://vk.com/editapp?id=YOUR_APP_ID&section=options
4. Clone this repository
5. Install

    ```bash
    $ npm i
    ```

## Usage
1.  ```
      $ CLIENT_SECRET=YOUR_CLIENT_SECRET CLIENT_ID=YOUR_CLIENT_ID node ./main.mjs
    ```
2. When first launch you need create access token. You have to click by links from console output and paste needed data to console input. All inputed info will be saved to session.json and you willn't need to input this stuff again.

