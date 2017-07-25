
(function(global) {

	const _GENERATIONS = [];


	const Evolution = function(data) {

		this.settings = Object.assign({
			history:     4,
			population: 64
		}, data);

	};


	Evolution.prototype = {

		cycle: function() {

			let population   = [];
			let s_history    = this.settings.history;
			let s_population = this.settings.population;


			// No Generations available
			// - fast route, just generate a new plain one

			if (_GENERATIONS.length === 0) {

				for (let p = 0; p < s_population; p++) {

					// New Population
					// - each Agent's brain is random by default

					population.push(new Agent());

				}

			} else {

				let current = _GENERATIONS[_GENERATIONS.length - 1];

				// Sort the current Population
				// - Higher fitness first (to 0)
				// - Lower fitness last (to length - 1)

				current.sort(function(agent_a, agent_b) {
					if (agent_a.fitness > agent_b.fitness) return -1;
					if (agent_a.fitness < agent_b.fitness) return  1;
					return 0;
				});


				// 20% Survivor Population
				// - Agent.clone() leads to unlinked clone
				// - this avoids coincidence of 1 Agent leading to multiple Entities

				for (let e = 0, el = Math.round(0.2 * s_population); e < el; e++) {

					let agent = current[e];

					if (population.length < s_population) {
						population.push(agent.clone());
					}

				}


				// 20% Mutant Population
				// - each Agent's Brain is random by default

				for (let m = 0, ml = Math.round(0.2 * s_population); m < ml; m++) {

					if (population.length < s_population) {
						population.push(new Agent());
					}

				}


				let b = 0;
				let b_population = Math.round(0.2 * s_population);

				// Breed Population
				// - b is automatically reset if bigger than 20%
				// - b leads to multiple incest Babies for multiple dominant Agents
				// - best Agent by fitness can now breed
				// - Babies are the ones from dominant population

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

			}


			// Track the Population
			// - just for the sake of Debugging, tbh.

			_GENERATIONS.push(population);


			// Optionally track more Generations
			// - in case something goes wrong
			// - set settings.history to higher value

			if (_GENERATIONS.length > s_history) {
				_GENERATIONS.splice(0, _GENERATIONS.length - s_history);
			}


			return population;

		}

	};


	global.Evolution = Evolution;

})(typeof global !== 'undefined' ? global : this);

