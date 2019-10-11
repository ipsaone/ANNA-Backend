'use strict';

const findRoot = require('find-root');
const path = require('path');
const util = require('util');
const root = findRoot(__dirname);
const fs = require('fs');
const inquirer = require('inquirer');
const hasha = require('hasha');
const superagent = require('superagent');


let group;
let request;

async function main() {

    // Check arguments
        // PATH
    if(process.argv.length < 3) { 
        console.log('Usage : node mirror_storage.js PATH [OPTIONS]');
        process.exit(-1);
    }
    const basefolder = process.argv[2];
    let new_base = "";
    let online_url = "";
    console.log("Mirroring", basefolder);
        // OPTIONS
    if(process.argv.length > 3) {
        for(let i = 3; i < process.argv.length; i++) {
            switch(process.argv[i-1]) {
                case '--in-folder': {
                    if(!process.argv[i]){ 
                        console.log('--in-folder needs a parameter.');
                        console.log('example : node mirror_storage.js ./test --in-folder mirorred-test')
                    }

                    new_base = process.argv[i];
                    i++;
                    break;
                }

                case '--online': {
                    if(!process.argv[i]){ 
                        console.log('--online needs a parameter.');
                        console.log('example : node mirror_storage.js ./test --online localhost:8888')
                    }

                    online_url = process.argv[i];
                    i++;
                    break;
                }
            }
        }
    }
    
    // Get connection
    if(online_url) {
        if(online_url[online_url.length - 1] == '/') {
            online_url = online_url.substr(0, online_url.length - 1);
        }
        request = require('supertest').agent(online_url);
    } else {
        // Initialize backend
        const loadApp = require(path.join(root, 'src', './app'));
        let {app, modules} = loadApp({noLog: true});
        request = require('supertest').agent(app);
        const db = modules.db;
    }

    // Throttle requests
    const Throttle = require('superagent-throttle');
    let throttle = new Throttle({
        active: true,     // set false to pause queue
        rate: 100,          // how many requests can be sent every `ratePer`
        ratePer: 60000,   // number of ms in which `rate` requests may be sent
        concurrent: 20     // how many requests can be sent concurrently
    });
    request.use(throttle.plugin());

    // Get credentials
    // That's not done on the command-line because of the security risk !
    let {username, password} = await inquirer.prompt([
        {type: "input", name: "username", message: "Username :"},
        {type: "password", name: "password", message: "Password :"}
    ]);
    let login_req = await request.post('/auth/login').send({username, password});
    if(login_req.status != 200) { 
        console.error("Login failure ( error ", login_req.status, ":", login_req.body, ")");
        process.exit(-1);
    }
    console.log("Login OK");
    let login = login_req.body;

    // Get upload group
    let groups_req = await request.get('/users/'+login.id+'/groups');
    if(groups_req.status != 200) {
        console.error("Couldn't list user groups ( error", groups_req.status, ":", group_req.body, ")"); 
        process.exit(-1);
    }
    let grp = await inquirer.prompt([{
            type: "list", 
            name: "group", 
            message: "Choose new folder group", 
            choices: groups_req.body.map(g => ({name: g.name, value: g.id}))
        }]);
    group = grp.group;

    // base folder = /
    let upload_id = 1;

    // If option to create new base folder
    if(new_base !== "") {
        // List root
        let list_req = await request.get('/storage/files/list/1');
        if(list_req.status != 200) { 
            console.error("Couldn't list root folder ( error", list_req.status, ":", list_req.body, ")"); 
            process.exit(-1);
        }
        let list = list_req.body.children;

        // If not existant already
        if(!list.map(c => c.name).includes(new_base)) {

            // Create new base folder
            let new_req = await request.post('/storage/upload')
                .field('isDir', true)
                .field('name', new_base)
                .field('dirId', 1)
                .field('groupId', group)
                .field('ownerRead', true)
                .field('ownerWrite', true)
                .field('groupRead', true)
                .field('groupWrite', true)
                .field('allRead', true)
                .field('allWrite', true)

            if(new_req.status != 200) {
                console.error("Couldn't create new base folder ( error", new_req.status, ":", new_req.body, ")"); 
                process.exit(-1);
            }
            console.log("Successfully created base folder");
            upload_id = new_req.body.fileId;
        }

        else {
            upload_id = list.filter(c => c.name === new_base)[0].fileId;
        }
    }

    // Mirror base folder
    await mirror(basefolder, upload_id);
}


// Mirror function :
async function mirror(localpath, remote_id) {
    console.log("mirrorring", localpath, "to folder id ", remote_id);

    // List contents
    let contents_names = await util.promisify(fs.readdir)(localpath)
    let contents_stat = await Promise.all(contents_names.map(entry => util.promisify(fs.lstat)(path.join(localpath, entry))));

    let contents = [];
    for (const [i, name] of contents_names.entries()) {
        contents.push({name: name, isDir: contents_stat[i].isDirectory(), isFile: contents_stat[i].isFile()});
    }

    for(const entry of contents) {
        // For each file :
        if(entry.isFile) {
            // List remote files
            let list_req = await request.get('/storage/files/list/'+remote_id);
            if(list_req.status != 200) { 
                console.error("Couldn't list folder ( error", list_req.status, ":", list_req.body, ")"); 
                process.exit(-1);
            }
            let list = list_req.body.children;

            // Check if it exists in the storage :
            if(list.map(e => e.name).includes(entry.name)) {
                let remote_file = list.filter(e => e.name === entry.name)[0];

                // Get file metadata
                let meta_req = await request.get('/storage/files/'+remote_file.fileId);
                if(meta_req.status !== 200) {
                    console.error("Couldn't get file metadata for file :", path.join(localpath, e.name));
                    continue;
                }
                let last_meta = meta_req.body.sort((a, b) => {
                    let dateA = new Date(a.createdAt);
                    let dateB = new Date(b.createdAt);
                    return (dateA.getTime() > dateB.getTime() ? -1 : 1)
                })[0];

                // Get local file sha1
                let local_sha1 = await hasha.fromFile(path.join(localpath, entry.name), {algorithm: 'sha1'});

                // Compare sha1 
                // console.log("comparing", last_meta.sha1, "and", local_sha1);
                if(meta_req.body.sha1 === local_sha1) {
                    // don't reupload
                    console.log("File already exists :", path.join(localpath, entry.name));

                }

                else {
                    // Upload revision
                    console.log("Uploading revision :", path.join(localpath, entry.name));
                    let rev_req = await request.put('/storage/upload/'+remote_file.fileId)
                        .attach('contents', path.join(root, './package.json'))
                        .field('isDir', false)
                        .field('name', entry.name)
                        .field('dirId', remote_id)
                        .field('groupId', group)
                        .field('ownerRead', true)
                        .field('ownerWrite', true)
                        .field('groupRead', true)
                        .field('groupWrite', true)
                        .field('allRead', true)
                        .field('allWrite', true)
                        
                    
                    if(rev_req.status !== 200) {
                        console.error("Couldn't upload revision for file", path.join(localpath, entry.name), "(", rev_req.status, ":", rev_req.body, ")");
                    }

                }
            }
            
            else {
                // upload new
                console.log("Uploading new file :", path.join(localpath, entry.name));
                let file_contents = await util.promisify(fs.readFile)(path.join(localpath, entry.name))
                let upload_req = await request.post('/storage/upload')
                    .attach('contents', file_contents)
                    .field('isDir', false)
                    .field('name', entry.name)
                    .field('dirId', remote_id)
                    .field('groupId', group)
                    .field('ownerRead', true)
                    .field('ownerWrite', true)
                    .field('groupRead', true)
                    .field('groupWrite', true)
                    .field('allRead', true)
                    .field('allWrite', true)
                    

                if(!upload_req.status === 200) {
                    console.error("Couldn't upload new file ( error", upload_req.status, ":", upload_req.body, ")"); 
                }


            }
        }
        
        // For each folder :
        else if(entry.isDir) {
            let remote_folder;

            // List remote files
            let list_req = await request.get('/storage/files/list/'+remote_id);
            if(list_req.status != 200) { 
                console.error("Couldn't list folder ( error", list_req.status, ":", list_req.body, ")"); 
                process.exit(-1);
            }
            let list = list_req.body.children;

            // Check if it exists in the storage :
            if(list.map(e => e.name).includes(entry.name)) {
                remote_folder = list.filter(e => e.name === entry.name)[0];
            }

            else {
                // Create new directory
                let create_req = await request.post('/storage/upload')
                    .field('isDir', true)
                    .field('name', entry.name)
                    .field('dirId', remote_id)
                    .field('groupId', group)
                    .field('ownerRead', true)
                    .field('ownerWrite', true)
                    .field('groupRead', true)
                    .field('groupWrite', true)
                    .field('allRead', true)
                    .field('allWrite', true)
                    
                    
                if(create_req.status != 200) {
                    console.error("Couldn't create new folder ( error", create_req.status, ":", create_req.body, ")"); 
                }

                remote_folder = create_req.body;
            }

            // Recurse with current folder + folder name
            await mirror(path.join(localpath, entry.name), remote_folder.fileId);

        } 

        else {
            console.error("Path is neither file nor directory :", path.join(localpath, entry.name));
        }
    }
}


(async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(-1);
    }
})();
