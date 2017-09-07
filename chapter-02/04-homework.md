
## Flappy Plane Implementation

Now that we know how to implement all details in
an evolutionary simulation, we need to make everything
come together and integrate it into the demo project.

A typical implementation tries to make not only a
single game, but tries to implement a game instance
in a way that it is parallelizable; so that our
overall population consists of agents across all
games.

We need to implement the population of our Evolution.
As previously stated, for our simulation we will use
a 20/20/60 population segmentation.


**Update Loop**

The first thing we have to implement is the evaluation
part in the Game's `update()` loop, so that you can
figure out the difference to a reinforced training
approach for yourself :)

```javascript
// ... somewhere in Game.prototype.update()


// Brain Computation
// - First Sensor is relative Plane Position
// - Second Sensor is relative Goal Position
// - Output is "To Flap or Not to Flap"

let inputs = [ plane.y / this.height, next_goal ];
let result = agent.compute(inputs);
if (result > 0.5) {
	plane.jump();
}
```

After the `Plane` has jumped inside the simulation, the
evaluation part happens. Later inside the `update()` loop
you will see that all Agents get their fitness set based
on how far in the X-direction they have progressed.

When a Plane has crashed, we set the Agent's fitness with
the current value. This is cheaper to compute than setting
the fitness value all the time.

```javascript
if (plane.alive === false) {

	// our statistics on the top left
	info.alive--;

	// plane was controlled by agent
	if (agent !== null) {
		agent.fitness = info.score;
	}

}
```

We also measure how many Planes are alive, so that the
simulation can be reset after all Planes have crashed.

When that happens, the `evolution.cycle()` method is
called and the simulation is reset, and the next Epoche
with a newly filled population starts to play the game
again from the beginning.


**Survivor Population**

All Agent instances have a `clone()` method that will
return an identical new instance of an Agent. We use
that method to fill the Survivor Population.

We need to use that method in order to prevent one Agent
instance controlling more than 1 Plane instance in our
simulation.

```javascript
let s_population = 64;
let current      = _GENERATIONS[_GENERATIONS.length - 1];


// ... somewhere in Evolution.prototype.cycle() method


// Sort the current Population
// - Higher fitness first (to 0)
// - Lower fitness last (to length - 1)

current.sort(function(agent_a, agent_b) {
	if (agent_a.fitness > agent_b.fitness) return -1;
	if (agent_a.fitness < agent_b.fitness) return  1;
	return 0;
});

// 20% Survivor Population

for (let e = 0, el = Math.round(0.2 * s_population); e < el; e++) {

	let agent = current[e];

	if (population.length < s_population) {
		population.push(agent.clone());
	}

}
```


**Mutant Population**

All Agents and their Brain instances have randomized
weights initially, so filling the Mutant Population
is very easy.

```javascript
let s_population = 64;


// ... somewhere in Evolution.prototype.cycle() method


// 20% Mutant Population

for (let m = 0, ml = Math.round(0.2 * s_population); m < ml; m++) {

	if (population.length < s_population) {
		population.push(new Agent());
	}

}
```


**Breed Population**

The Breed Population consists of Agents that are
combined in the sense of DNA. Remember the `Agent.prototype.crossover()`
method that we implemented?

That is the method that helps us combine two different
DNAs into two different babies, one that looks more
like the "father", and one that looks more like the
"mother" - so that both parents have an equal chance
of evolving into dominant genes (in the sense of darwinism).

However, there are two different ways to ensure a
healthy evolution when it comes to what kind of
agents to choose for crossovers.

1. Choose only from the fittest 20% and use others from
   the fittest 20% to cross-breed. The upside is a fast
   learning curve, the downside is less adaption to new
   problems.

2. Choose one Agent from the fittest 20% and randomize
   the other Agent, so that even the ones with the worst
   performance have an equal chance to form into a dominant
   species. The upside is very fast adaption to new
   problems, the downside is a very slow learning curve.

In our scenario of the game Flappy Plane, the game world
and its problems (or how to react on different challenges)
doesn't change very much. So in our scenario we will use
the former way of cross-breeding Agents and use only the
fittest Agents for breeding.

```javascript
let s_population = 64;


// ... somewhere in Evolution.prototype.cycle() method


let b = 0;
let b_population = Math.round(0.2 * s_population);

// Breed Population
// - b is automatically reset if bigger than 20%
// - b leads to multiple incest Babies for multiple dominant Agents
// - best Agent by fitness can now breed
// - Babies are the ones from dominant Population

while (population.length < s_population) {

	let agent_mum = current[b];
	let agent_dad = current[b + 1];
	let children  = agent_mum.crossover(agent_dad);

	if (population.length < s_population) {
		population.push(children[0]);
	}

	if (population.length < s_population) {
		population.push(children[1]);
	}

	b += 1;
	b %= b_population;

}
```

An important note here is that we previously always
rounded up our percentage of the population, so when
we have an uneven population size (e.g. 27) the algorithm
would fail if we did not check each time before we push
a new Agent into the population.

In that case the last son will not make it into the
population and only the daughter will make it.

