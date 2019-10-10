let request = require('request-promise-native');
const fs = require('fs');
const util = require('util');

let key = "ccadfc39a45648e61a71fcf6529cf695"
let token = "57c4bb9bb4e9dcce7de9a37e16179fe557978ad6c19fad463309dde14e7373f4"
let board_id = "XmfMeOZK"
let list_id = "5d9f455e6b055c64ebe6d01f"


async function main() {
    let name = "ERREUR OMG";
    let desc = "L'erreur est très longue";
    let res = await request({
        method: "POST",
        uri: "https://api.trello.com/1/cards/", 
        json: true,
        qs: {
            name: name,
            desc: desc,
            idList: list_id,
            fileSource: 
            key, token
          }
    });
    let attachment_path = "./mirror_storage.js";
    let res2 = await request({
        method: "POST",
        uri: "https://api.trello.com/1/cards/"+res.id+"attachments",
        json: true,
        qs: {
            name: "test.js",
            key, token
          },
        headers: {
            "Content-Type": "multipart/form-data"
        },
        formData : {
            "file" : fs.createReadStream(attachment_path)
        }
    })
    console.log(res);
}

(async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(-1);
    }
})();
