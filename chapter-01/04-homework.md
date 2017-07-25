
## Example Brain Implementation

Now that we know how the rule of thumb can be used to
compute a network's size, we can now start to implement it.

A typical implementation also wraps `Math.random()` into
something that we can clamp from `-1.0` to `1.0` as
`Math.random()` in ECMAscript (or other languages) only
generates values from `0.0` to `1.0`.

```javascript
const _random = function() {
	return ((Math.random() * 2) - 1);
};
```

Important: Neuron values and weights can also be negative -
so we need to keep that in mind when debugging our code
later.

We also know from this chapter that we need to implement an
activation function. For now, sigmoid is good enough and we
implement it like this:

```javascript
const _sigmoid = function() {
	return (1 / (1 + Math.exp((-1 * value) / 1)));
};
```


**Brain Initialization**

Our Brain implementation currently lacks a proper
initialization, so we need to implement this first. We use
the same data structures as previously mentioned and
the `layers[]` array to represent the contens of our neural
network.

When we generate our neural network, we also have to keep
these situations in mind:

1. The input layer's neurons have no weights as they are not
   connected into the previous (to the left) direction.

2. Each hidden layer's neuron has a `weights[]` array with
   the same size as the neuron amount from its previous (to
   the left) layer.

3. The output layer is identical in its behaviour as the
   hidden layers (each neuron also has a `weights[]` array),
   but the amount of neurons is the size of the `outputs`
   array. Therefore it can be different in size compared to
   the hidden layer and/or input layer.


```javascript
const Brain = function() {
	this.layers = [];
};


Brain.prototype.initialize = function(inputs, outputs) {

	// FIXME: Task for reader - Insert Rule of Thumb here.

	let input_size  = 3;
	let output_size = 2;
	let layers_size = 3;
	let hidden_size = input_size > output_size ? input_size : output_size;


	this.layers = new Array(layers_size).fill(0).map((layer, l) => {

		let prev = hidden_size;
		let size = hidden_size;

		// Input Layer
		if (l === 0) {

			prev = 0;
			size = input_size;

		// First Hidden Layer
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

	// TODO: This comes next
	return null;

};
```

As our Example Code shows, we currently totally ignore
training of our `Brain` as we are not quite ready to
understand Backpropagation. Our neural network currently
gives us only seemingly random outputs to a given set of
inputs.

Alternatively, we could find the weights for each neuron by
using evolution or genetic programming (as we will learn
later).

The usage of our `Brain` implementation is quite simple:

```javascript
// API Usage

let brain = new Brain();
let data  = { inputs: [1,0], outputs: [1] };

// Initialize by reference dataset
brain.initialize(data.inputs, data.outputs);


// Compute inputs and return outputs
let outputs = brain.compute(data.inputs);


console.log('computed:', outputs);
console.log('expected:', data.outputs);
```



**Feed-Forward Computation**

Feed-Forward Computation is a very simple neural network
architecture that is only forwarding its values based on
each neuron's connections (weights). As every neuron is
typically having randomized weights initially, the use cases
of them are fairly limited.

However, given a Genetic Programming or Evolutionary /
Competitive concept, they can be powerful networks that
learn quick, fast and efficient. Typical use cases are
bruteforcing or guessing of complex data structures in an
efficient manner or signal analysis and adaptive signal
generation.


As feed-forward neural networks are *very* easy to
implement, we are going to dig into them before we can learn
more about backpropagation (and reinforcement learning in
general).

A typical FFNN has two different situations that our code
needs to respect:

1. The input layer is a special case. No weights, directly
   update each neuron's value.

2. For each hidden layer's and output layer's neuron, map
   and store the sum of values into the `values` variable
   and summate them together. Afterwards, we activate the
   neuron with the `_sigmoid(value)` method where `value`
   is the sum of all values of all connected neurons.


Taking our previous Example Code, we need to override its
`Brain.prototype.compute(inputs)` method with this code:

```javascript
Brain.prototype.compute = function(inputs) {

	let layers = this.layers;

	// Set Input Layer values
	layers[0].forEach((neuron, n) => neuron.value = inputs[n]);


	// Feed forward for Hidden Layers + Output Layer
	layers.slice(1).forEach((layer, l) => {

		let prev_layer = layers[layers.indexOf(layer) - 1];

		layers.forEach(neuron => {

			let values = prev_layer.map((prev, p) => prev.value * neuron.weights[p]);
			let sum    = values.reduce((a, b) => a + b, 0);

			neuron.value = _sigmoid(sum);

		});

	});


	// return Output Layer values
	return layers[layers.length - 1].map(neuron => neuron.value);

};
```

As we might remember from the previous article, the
`_sigmoid(value)` method is important. It activates each
neuron based on the total of values of its connected
(weighted) neurons.

The `neuron.value` currently is mostly existing for easy
computation purposes right now as we don't reuse it anywhere
else. But we need it later for backpropagation, so that we
can tweak its value with a so-called error function.

Each `neuron.weights` array is therefore identical in its
size to the amount of neurons in the previous layer (layer
to the left).

