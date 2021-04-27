const commander = require('commander'),
    fs = require('fs'),
    chalk = require('chalk'),
    pkg = require('../package.json'),
    simpleGit = require('simple-git'),
    path = require('path'),
    prompt = require('prompt');

prompt.start();

commander.version(pkg.version).description('Filler for cobalt presentations');
commander
    .option('-maj --major', 'Up by major (X.0.0)')
    .option('-min --minor', 'Up by minor (0.X.0)')
    .option('-p --patch', 'Up by patch (0.0.X)')
    .description('Merge develop to master and up tag')
    .action(() => {
        process.chdir('d:\\projects\\viseven\\tysabri-fr-fre-diapo\\');
        start();
    })

export function cli(args) {
    commander.parse(args)
}

async function start() {
    let repo = await simpleGit(path.resolve(process.cwd()), {binary: 'git'});
    try {
        var lastTag = await repo.tags('master');
        lastTag = getTag(lastTag.latest);
        var tagFromApp = pkg.version;
        tagFromApp = getTag(tagFromApp);
        console.log('tagFromApp:', tagFromApp);
    } catch (e) {
        console.log('No tags, on branch master and in settings/app.json!');
        process.exit(1);
    }


    let currentTag = lastTag ? lastTag : tagFromApp
    await repo.checkout('develop');
    let newTag = upTag(currentTag);

    promptMerge(currentTag.join('.'), newTag);

    mergeProject(repo, newTag);


}

function getTag(tag) {
    return tag.match(/\d/gi).map(item => Number.parseInt(item))
}

function upTag(tag) {
    let newTag = [...tag];
    if (commander.patch) {
        newTag[2] += 1;
    }
    if (commander.minor) {
        newTag[1] += 1;
        newTag[2] = 0;
    }
    if (commander.major) {
        newTag[0] += 1;
        newTag[1] = 0;
        newTag[2] = 0;
    }

    return `v${newTag.join('.')}`
}

function promptMerge (oldTag,newTag) {
    const promptProperties = [
        {
            name: 'confirm',
            validator: /[y,Y,n,N]/,
            warning: 'Yes (y) or no (n)?'
        }
    ];
    prompt.message = `Merge from tag ${oldTag} to tag ${newTag} ?`;
    prompt.get(promptProperties, function (err, result) {
        if (err) {
        }
        let negativeAnswers = ['n', 'no'];
        if (negativeAnswers.includes(result.confirm.toLowerCase()))  process.exit(1)
    });
}

async function mergeProject(repo, newTag) {
    // repo.mergeFromTo('develop', 'master','Merged')
}