
(function(global) {

	const _random = function() {
		return (Math.random() * 2) - 1;
	};

	const _sigmoid = function(value) {
		return (1 / (1 + Math.exp((-1 * value) / 1)));
	};



	const Brain = function() {
		this.layers = [];
	};


	Brain.prototype = {

		initialize: function(inputs, outputs) {

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

		},

		compute: function(inputs) {

			let layers = this.layers;

			// Set Input Layer values
			layers[0].forEach((neuron, n) => (neuron.value = inputs[n]));


			// Feed forward for Hidden Layers + Output Layer
			layers.slice(1).forEach((layer, l) => {

				let prev_layer = layers[layers.indexOf(layer) - 1];

				layer.forEach(neuron => {

					let values = prev_layer.map((prev, p) => prev.value * neuron.weights[p]);
					let sum    = values.reduce((a, b) => a + b, 0);

					neuron.value = _sigmoid(sum);

				});

			});


			// return Output Layer values
			return layers[layers.length - 1].map(neuron => neuron.value);

		},

		serialize: function() {

			let weights = [];

			this.layers.forEach(layer => {

				layer.forEach(neuron => {
					weights.push.apply(weights, neuron.weights);
				});

			});

			return weights;

		},

		deserialize: function(weights) {

			let index = 0;

			this.layers.forEach(layer => {

				layer.forEach(neuron => {

					neuron.weights = neuron.weights.map(weight => {
						return weights[index++];
					});

				});

			});

		}

	};


	global.Brain = Brain;

})(typeof global !== 'undefined' ? global : this);

