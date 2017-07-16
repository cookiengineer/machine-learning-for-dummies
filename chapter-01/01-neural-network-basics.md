
## Neural Network Basics

Neural networks aren't that hard to understand. They
are only not-so-well explained to newbies. As everyone
is using maths, I'm going to try a different way here.

If we talk about a simple neural network, it's always
structured in three different "types of layers":

1. Input layers
2. Hidden layers
3. Output layers

![neural-network](./media/neural-network.png)

The input layer typically represents sensors, where
each input value of the array represents a value from
`0.0` to `1.0`. People like to name that vectors, I name
them arrays with values.

The output layer typically represents a `yes/no` type of
an answer to a question - or in other use cases vectorized
properties that the algorithm will interpolate on (e.g.
when an NN is learning a time-sensitive animation curve).

However, that vectorized properties could be kind of
anything, from enums to position objects (`x,y,z vector`)
or even alpha transparencies in your program.

The only important thing here is that when you represent
a state, it should be representable in a scale (from `0.0`
to `1.0`) given a predefined error-forgiving precision.

As neural networks are an approximation tool, they need
to know if they "got closer to the best solution". The
"getting closer" part is what's called a reward / training
function; and we'll dig into that later.



**Neural Network Adapters**

Neural networks are dumb. They can only understand values
from `0.0` to `1.0`; which means we have to write adapters
for it so it can understand what the data means.

Those adapters do nothing more than transform values into
an area between `0.0` and `1.0`. In more generic implementations
they tend to be called sensors and controls, given the idea
of reusing them for other neural network structures.

For example, when we want to analyze a pixel position of
the player's paddle in a pong game, we would use something
like this:

```javascript
let input = [ 0, 0, 0 ]; // x,y,z

input[0] = entity.position.x / screen.width;
input[1] = entity.position.y / screen.height;
input[0] = 0; // we don't have a z position, have we?


let answer = neural_network.compute(input);
if (answer[0] > 0.5) {
	entity.moveDownwards();
} else {
	entity.moveUpwards();
}
```

Now we know that a neural network can compute inputs and
give us some outputs. Dependent on how our simulation is
built, we can use that for different use cases.

For example, we can ask a neural network a yes/no type of
question. So when the resulting output value is bigger
than `0.5`, we would treat it as the answer `yes` and
otherwise treat it as the answer `no`.

Another example is that neural networks also can learn
relations to complex data structures and objects. For
example, an output array with the values `[ 0.5, 1.0, 0.827 ]`
would be a position coordinate in our simulation world.

However, it is important to understand that a neural network
only understands values from `0.0` to `1.0` and that we
need to write adapters for it so it can understand what's
going on.

