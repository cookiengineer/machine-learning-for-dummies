#!/usr/bin/env node

const Brain = require('./Brain.js');



let brain = new Brain();
let data  = { inputs: [ 1, 0 ], outputs: [ 1 ] };

brain.initialize(data.inputs, data.outputs);


let outputs = brain.compute(data.inputs);

console.log('computed:', outputs);
console.log('expected:', data.outputs);

