const commander = require('commander'),
	fs = require('fs'),
	chalk = require('chalk'),
	path = require('path');


commander.version(pkg.version).description('Filler for cobalt presentations');
commander
	.option('-maj --major', 'Up by major (X.0.0)')
	.option('-min --minor', 'Up by minor (0.X.0)')
	.option('-p --patch', 'Up by patch (0.0.X)')
	.description('Merge develop to master and up tag')
	.action(() => {

	})

export function cli(args) {
	commander.parse(args)
}