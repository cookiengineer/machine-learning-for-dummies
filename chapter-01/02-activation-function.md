
## Activation Functions

We now know that a basic neural network is structured
in layers, where each layer has multiple neurons.

We ignore other concepts of neural networks for now,
but there are quite complex architectures around that
are not explainable right now.

Anyways, we currently assume that our neural network
looks like this:

![neural-network](./media/neural-network.png)

When we take a closer look at the graphic, we can see
that a neural network has multiple neurons that have
connections to other neurons.

These connections and "how active" they are is
represented using so-called weights. A weight typically
represents only one neuron connection.

The important part here is that input neurons have no
connection to a previous layer, so that the `compute()`
method in our implementation has to respect that input
neurons just directly get their `neuron.value` set with
the input array's values.

When talking about how neurons communicate, how the
weights change over time and when to activate the next
neuron in our network - that's a so-called activation
function.

Activation functions are a bit of a fuzz currently, as
everyone has their own opinion on them. I'll skip that
and for now we only use a simple sigmoid activation
function.

An example sigmoid activation function can be something
like this:


```javascript
const _sigmoid = function(value) {
	return (1 / (1 + Math.exp((-1 * value) / 1)));
};
```

All in all you only have to know that activation functions
are the idea to simulate how neurons work. The activation
function in reality does nothing more than take one value
(formally speaking a sum of values) and transforms it to
another one; where the behaviour is similar to the ease-out
or ease-in-out tweening functions in the user interface
and animation world.

That means they typically rapidly increase (ease-in) when
the input value is lower than `0.5` and they slowly increase
(ease-out) when the value is bigger than `0.5`.

However, all activation functions can only output values
from `0.0` to `1.0`, as a neuron will get the output value
of the activation function set as its own value in the
`compute()` process.



**Overfitting and Underfitting**

Overfitting and the discussion about it is a more complex
topic, but I'm bluntly gonna ignore it totally for now to
save time and unnecessary confusion.

However, overfitting describes when the neural network was
trained and assumes too much data to be positive (optimistic
behaviour) while underfitting describes when it assumes too
much data to be negative (depressive behaviour).

What's important is that you always need to split the data
into a training set and a test set. As you generally don't
want "NN fingerprinting" in your use cases, separating the
data set is important - so that your neural network does
not cheat and learn only the answers for the test without
thinking about what's going on with the question.

