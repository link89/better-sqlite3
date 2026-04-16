'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

/*
	Searches for the native addon in common build output directories.
	This replaces the "bindings" package, which is CommonJS-only and
	causes issues when used with ESM modules.
 */
function findAddon(name) {
	const candidates = [
		path.join(ROOT, 'build', 'Release', name),
		path.join(ROOT, 'build', 'Debug', name),
		path.join(ROOT, 'prebuilds', `${process.platform}-${process.arch}`, name),
	];

	for (const candidate of candidates) {
		try {
			fs.accessSync(candidate);
			return candidate;
		} catch (e) {
			if (e.code !== 'ENOENT') throw e;
		}
	}

	throw new Error(
		`Could not find native addon "${name}". Tried:\n` +
		candidates.map(c => '  - ' + c).join('\n')
	);
}

exports.find = findAddon;

exports.load = function load(name) {
	return require(findAddon(name));
};
