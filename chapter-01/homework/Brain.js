
const _random = function() {
	return (Math.random() * 2) - 1;
};

const _sigmoid = function(value) {
	return (1 / (1 + Math.exp((-1 * value) / 1)));
};



const Brain = function(settings) {
	this.layers = [];
};

Brain.prototype.initialize = function(inputs, outputs) {

	let input_size  = inputs.length;
	let output_size = outputs.length;

	let layers_size = 3;
	let hidden_size = 1;

	if (input_size > output_size) {
		hidden_size = input_size;
		layers_size = Math.max(input_size - output_size, 3);
	} else {
		hidden_size = output_size;
		layers_size = Math.max(output_size - input_size, 3);
	}


	this.layers = new Array(layers_size).fill(0).map((layer, l) => {

		let prev = hidden_size;
		let size = hidden_size;

		// Input Layer
		if (l === 0) {

			prev = 0;
			size = input_size;

			// first Hidden Layer
		} else if (l === 1) {

			prev = input_size;

			// Output Layer
		} else if (l === layers_size - 1) {
			size = output_size;
		}


		// Each Neuron has value and weights
		return new Array(size).fill(0).map(_ => ({
			value:   _random(),
			weights: new Array(prev).fill(0).map(val => _random())
		}));

	});

};

Brain.prototype.compute = function(inputs) {

	// TODO: Implement compute() method
	// - set input values
	// - for each hidden layer and for each neuron do
	// -- multiply previous neuron's values with neuron weights
	// -- sum values together
	// -- set neuron.value to _sigmoid(sum)
	// - return output values

};



// XXX: node.js / html5 compatibility stuff

if (typeof module !== 'undefined') {

	module.exports = Brain;

} else if (typeof global !== 'undefined') {

	global.Brain = Brain;

} else if (typeof window !== 'undefined') {

	window.Brain = Brain;

}

