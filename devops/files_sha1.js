const fs = require('fs');
const sha1 = require('hasha');
const util = require('util');
const path = require('path');
const hasha = require('hasha');
const minimatch = require('minimatch');

let log = true;

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

let callCompute = async (folder, ignore, logging) => {
    let ignore_paths = [];
    log = logging;
    if(ignore) {
        let ignores = await util.promisify(fs.readFile)(ignore);
        ignore_paths = ignores.toString('utf-8').split('\n').filter(e => !isEmptyOrSpaces(e)).map(e => path.join(folder, e));
    }

    return computeFolder(folder, ignore_paths);
}

let computeFolder = async (folder, ignore) => {
    let obj = {};

    let contents_names = await util.promisify(fs.readdir)(folder)
    let contents_stat = await Promise.all(contents_names.map(entry => util.promisify(fs.lstat)(path.join(folder, entry))));

    let contents = [];
    for (const [i, name] of contents_names.entries()) {
        contents.push({name: name, isDir: contents_stat[i].isDirectory(), isFile: contents_stat[i].isFile()});
    }


    for(const entry of contents) {
        if(Array.isArray(ignore) && (
            ignore.filter(e => minimatch(e, path.join(folder, entry.name))).length > 0
            || ignore.includes(entry.name)
        
        )) {
            if(log) {console.log("Skipping", entry.name);}
            continue;
        }


        if(entry.isFile) {
          let sha1 = await hasha.fromFile(path.join(folder, entry.name), {algorithm: 'sha1'});
          // console.log("Adding", entry.name)
          obj[entry.name] = sha1;

        } else if (entry.isDir) {
            if(log) {console.log("Handling", path.join(folder, entry.name));}
            
            obj[entry.name] = await computeFolder(path.join(folder, entry.name), ignore);
        } else {
            console.error("Entry is neither file nor directory :", path.join(folder, entry.name));
        }

    }

    return obj;

}

let writeSha1 = async (folder="./", ignore=null) => {
    let contents = await callCompute(folder, ignore, true);
    await util.promisify(fs.writeFile)(path.join(folder, "sha1.json"), JSON.stringify(contents));
}

if (require.main === module) {
    if(process.argv.length < 2) {
        console.log("Use : node files_sha1.js FOLDER [IGNOREFILE]");
        process.exit(-1);
    }
    writeSha1(process.argv[2], process.argv[3] ? process.argv[3] : null)
        .then(() => process.exit(0)).catch(e => {console.error(e); process.exit(-1);});


} else {
    module.exports.compute = callCompute
}
