const commander = require('commander'),
    fs = require('fs'),
    chalk = require('chalk'),
    simpleGit = require('simple-git'),
    path = require('path'),
    pkg = require(`${path.resolve(process.cwd()+'\\package.json')}`),
    prompt = require('prompt');

prompt.start();

// commander.version(pkg.version).description('Filler for cobalt presentations');
commander
    .option('-maj --major', 'Up by major (X.0.0)')
    .option('-min --minor', 'Up by minor (0.X.0)')
    .option('-p --patch', 'Up by patch (0.0.X)')
    .description('Merge develop to master and up tag')
    .action(() => {
        // process.chdir('d:\\projects\\viseven\\tysabri-fr-fre-diapo\\');
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

    } catch (e) {
        console.log('No tags on branch master, take from package.json!');
        lastTag = getTag(pkg.version);
    }

    await repo.checkout('develop');
    let newTag = upTag(lastTag);
    console.log('newTag:', newTag);

    promptMerge(lastTag.join('.'), newTag,repo);



}

function getTag(tag) {
    return tag.match(/\d.?/gi).map(item => Number.parseInt(item))
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

function promptMerge (oldTag,newTag,repo) {
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
            console.log('err:', err);
        }
        let negativeAnswers = ['n', 'no'];
        let positiveAnswers = ['y', 'yes'];
        if (negativeAnswers.includes(result.confirm.toLowerCase()) && !positiveAnswers.includes(result.confirm.toLowerCase()))  {process.exit(1)} else {mergeProject(repo, newTag)}
    });
}

async function mergeProject(repo, newTag) {
    pkg.version = newTag.slice(1);
    let jsonString = JSON.stringify(pkg, null, 4);

    fs.writeFileSync(`${path.resolve(process.cwd()+'\\package.json')}`, jsonString, (err) => {
        if (err) {
            console.log(`Error writing file ${path}`, err)
        }
    });
    await repo.add('*').commit(`Release ${newTag}`).push();
    await  repo.addTag(newTag.slice(1)).pushTags('origin');
    await repo.checkout('master');
    await repo.merge(['develop']).push();
    await repo.checkout('develop');
    console.log('Done');
}