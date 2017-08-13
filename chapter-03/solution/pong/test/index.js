#!/usr/bin/env node


const _fs       = require('fs');
const _path     = require('path');
const _ROOT     = _path.resolve(__dirname, '..');
const _TRAINING = [{
	inputs:  [ 1, 0 ],
	outputs: [ 1 ]
}, {
	inputs:  [ 0, 1 ],
	outputs: [ 1 ]
}, {
	inputs:  [ 0, 0 ],
	outputs: [ 0 ]
}, {
	inputs:  [ 1, 1 ],
	outputs: [ 0 ]
}];


require(_ROOT + '/source/Brain.js');
// require(_ROOT + '/source/Brain__OLD.js');
require(_ROOT + '/source/Agent.js');


let agent = new Agent();

agent.brain.initialize(_TRAINING[0].inputs, _TRAINING[0].outputs);



let before = [];
let after  = [];


_TRAINING.forEach(dataset => before.push(agent.compute(dataset.inputs)));

for (let t = 0; t < 20000; t++) {
	_TRAINING.forEach(dataset => agent.learn(dataset.inputs, dataset.outputs));
}

_TRAINING.forEach(dataset => after.push(agent.compute(dataset.inputs)));


console.log('expect\tbefore\t\t\tafter');

_TRAINING.forEach((expected, e) => {
	console.log('' + expected.outputs[0] + '\t' + before[e][0] + '\t' + after[e][0]);
});

