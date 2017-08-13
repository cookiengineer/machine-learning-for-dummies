
(function(global) {

	const _LEARNING_RATE     = 0.3;
	const _LEARNING_MOMENTUM = 0.9;


	const _error_function = function(value, expected) {
		return value * (1 - value) * (expected - value);
	};

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


				return new Array(size).fill(0).map(_ => ({
					bias:     1,
					delta:    0,
					value:    _random(),
					gradient: new Array(prev).fill(0),
					weights:  new Array(prev).fill(0).map(val => _random())
				}));

			});

		},

		compute: function(inputs) {

			let layers = this.layers;


			// Set Input Layer values
			layers[0].forEach((neuron, n) => (neuron.value = inputs[n]));


			// Feed forward for Hidden Layers + Output Layer
			layers.slice(1).forEach(layer => {

				let prev_layer = layers[layers.indexOf(layer) - 1];

				layer.forEach(neuron => {

					let values = prev_layer.map((prev, p) => prev.value * neuron.weights[p]);
					let sum    = values.reduce((a, b) => a + b, 0);

					neuron.value = _sigmoid(sum + neuron.bias);

				});

			});


			// return Output Layer values
			return layers[layers.length - 1].map(neuron => neuron.value);

		},

		learn: function(inputs, outputs) {

			this.compute(inputs);


			let layers = this.layers;

			// Calculate Gradient for Output Layer
			layers[layers.length - 1].forEach((neuron, n) => {
				neuron.delta = _error_function(neuron.value, outputs[n]);
			});


			// Calculate Gradient for Hidden Layers + Input Layer
			layers.slice(0, layers.length - 1).reverse().forEach(layer => {

				let next_layer = layers[layers.indexOf(layer) + 1];


				layer.forEach((neuron, n) => {

					let deltas = next_layer.map(next => next.delta * next.weights[n]);
					let error  = deltas.reduce((a, b) => a + b, 0);

					neuron.delta = neuron.value * (1 - neuron.value) * error;

				});

			});


			// Re-Calculate weights based on Gradient
			layers.forEach((layer, l) => {

				let prev_layer = layers[layers.indexOf(layer) - 1];

				layer.forEach(neuron => {

					neuron.bias += _LEARNING_RATE * neuron.delta;


					// XXX: Input Layer has no weights
					if (l > 0) {

						neuron.weights.forEach((weight, w) => {

							let value = prev_layer[w].value;
							let delta = _LEARNING_RATE * neuron.delta * value;

							neuron.weights[w] += delta + _LEARNING_MOMENTUM * neuron.gradient[w];
							neuron.gradient[w] = delta;

						});

					}

				});

			});

		}

	};


	global.Brain = Brain;

})(typeof global !== 'undefined' ? global : this);

