
(function(global) {

	let _CANVAS  = null;
	let _CONTEXT = null;
	let _IMAGE   = null;


	(function() {

		let img = new Image();

		img.onload = function() {
			_IMAGE = this;
		};

		img.src = './source/Game.png';

	})();


	(function(document) {

		let canvas = document.querySelector('canvas');
		if (canvas === null) {
			canvas = document.createElement('canvas');
			canvas.width  = 800;
			canvas.height = 512;
		}


		if (canvas.parentNode === null) {

			document.addEventListener('DOMContentLoaded', function() {
				document.body.appendChild(canvas);
			}, true);

		}

		_CANVAS  = canvas;
		_CONTEXT = canvas.getContext('2d');

	})(global.document);


	const Game = function() {

		this.planes = [];
		this.goals  = [];
		this.fps    = 60;

		this.width      = _CANVAS.width;
		this.height     = _CANVAS.height;
		this.evolution  = null;
		this.population = [];

		this._has_ended  = false;
		this._background = 0;
		this._iterations = 0;
		this._info       = {
			alive:      0,
			generation: 0,
			highscore:  0,
			score:      0
		};
		this._randomizer = new Twister(1337);

	};


	Game.prototype = {

		setFPS: function(val) {

			val = typeof val === 'number' ? (val | 0) : 60;

			if (val > 0) {
				this.fps = val;
			}

		},

		start: function() {

			let evolution = this.evolution;
			if (evolution !== null) {

				// Autopilot Mode
				// - Use Evolution to generate Agents (Planes)

				this.planes = [];
				this.goals  = [];

				// Evolution Cycle / Epoche
				// - population is an Array of Agent instances
				// - Each Agent represents one Plane

				this.population = evolution.cycle();
				this.population.forEach(function(agent) {
					this.planes.push(new Plane());
				}.bind(this));

			} else {

				// Manual Mode
				// - Planes were set externally
				// - Reset all Planes (on restart)

				this.goals = [];

				this.planes.forEach(function(plane) {
					plane.x       = 80;
					plane.y       = 250;
					plane.gravity = 0;
					plane.alive   = true;
				});

			}


			// Sweet statistics and stuff
			this._info.alive = this.planes.length;
			this._info.score = 0;
			this._info.generation++;

			// Seed-based Randomizer is IMPORTANT
			// - used only for Hurdle (Goal) generation
			// - this allows identical level structure
			// - still random, but in same order
			// - Math.random() will lead to worse performance
			// - Math.random() will let NNs not learn so efficiently

			this._randomizer = new Twister(1337);

		},

		stop: function() {
			this._has_ended = true;
		},

		render: function() {

			let context = _CONTEXT;
			let info    = this._info;
			let planes  = this.planes;
			let goals   = this.goals;


			context.clearRect(0, 0, this.width, this.height);


			if (_IMAGE !== null) {

				let bg_width = _IMAGE.width;

				for (let b = 0; b < Math.ceil(this.width / bg_width) + 1; b++) {

					context.drawImage(
						_IMAGE,
						b * bg_width + Math.floor(this._background % bg_width),
						0
					);

				}

			}


			for (let g = 0, gl = goals.length; g < gl; g++) {

				let goal = goals[g];
				if (goal.alive === true) {
					goal.render(context);
				}

			}

			for (let p = 0, pl = planes.length; p < pl; p++) {

				let plane = planes[p];
				if (plane.alive === true) {
					plane.render(context);
				}

			}


			context.fillStyle = '#ffffff';
			context.font      = '20px "DejaVu Sans Mono", sans-serif';


			context.fillText('Score:      ' + info.score,      10, 25);
			context.fillText('High Score: ' + info.highscore,  10, 50);
			context.fillText('Generation: ' + info.generation, 10, 75);
			context.fillText('Agents:     ' + info.alive,      10, 100);


			// This flag is set if external code
			// "wants" to stop the current game
			// - you know, higher FPS than we can
			//   actually compute stuff.

			if (this._has_ended === false) {

				requestAnimationFrame(function() {
					this.render();
				}.bind(this));

			}

		},

		update: function() {

			let info       = this._info;
			let planes     = this.planes;
			let goals      = this.goals;
			let population = this.population;


			let next_goal = 0;

			if (planes.length > 0 && goals.length > 0) {

				// Find Next Goal
				// - only if planes are available
				// - only if goals are available

				let agent = planes[0];
				let awh   = planes[0].width / 2;
				let gwh   = goals[0].width  / 2;

				for (let g = 0, gl = goals.length; g < gl; g++) {

					let goal = goals[g];

					// This is AABB collision
					// - if goal is "being passed through"
					// - else if next goal is ahead in X-position

					if (agent.x > goal.x && agent.x - awh < goal.x + gwh) {
						next_goal = goal.y / this.height;
						break;
					} else if (agent.x < goal.x - gwh) {
						next_goal = goal.y / this.height;
						break;
					}

				}

			} else {

				// No Goal available
				// - flap to the middle, so Planes won't die
				next_goal = 0.5;

			}


			for (let p = 0, pl = planes.length; p < pl; p++) {

				let agent = population[p] || null;
				let plane = planes[p];

				if (plane.alive === true) {

					if (agent !== null) {

						// Brain Computation
						// - First Sensor is relative Plane Position
						// - Second Sensor is relative Goal Position
						// - Output is "To Flap or Not to Flap"

						let inputs = [ plane.y / this.height, next_goal ];
						let result = agent.compute(inputs);
						if (result > 0.5) {
							plane.jump();
						}

					}


					// IMPORTANT:
					// - update Plane position _AFTERWARDS_
					// - If FPS > 60, this allows hard
					//   computation cycles for slow machines

					plane.update(this);


					// If Plane died in update() method,
					// track the Agent fitness. Less computation
					// intensive than tracking it always.

					if (plane.alive === false) {

						info.alive--;

						if (agent !== null) {
							agent.fitness = info.score;
						}

					}

				}

			}


			// Goals are updated _AFTERWARDS_
			// This is important, as Brain
			// Computation is dependent on
			// Goal Position.

			for (let g = 0, gl = goals.length; g < gl; g++) {

				let goal = goals[g];

				goal.update(this);

				if (goal.alive === false) {
					goals.splice(g, 1);
					gl--;
					g--;
				}

			}


			// Every Reset Iteration, generate
			// Goals. Seed-Based Randomizer (with
			// static seed) leads to identical
			// level structure after Game.start()
			// or "restart" was called again.

			if (this._iterations === 0) {

				let border = 128;

				goals.push(new Goal({
					x: this.width,
					y: border + Math.round(this._randomizer.random() * (this.height - border * 2))
				}));

			}


			// Background Shinyness and
			// Iterations for Goal Spawn

			this._background -= 0.5;
			this._iterations++;

			if (this._iterations === 90) {
				this._iterations = 0;
			}


			// Restart the Game if all
			// Planes died already

			if (info.alive === 0) {
				this.start();
			}


			// Track the current Score
			// Track the High Score

			info.score++;
			info.highscore = Math.max(info.score, info.highscore);


			// This flag is set if external code
			// "wants" to stop the current game
			// - you know, higher FPS than we can
			//   actually compute stuff.

			if (this._has_ended === false) {

				setTimeout(function() {
					this.update();
				}.bind(this), 1000 / this.fps);

			}

		}

	};


	global.Game = Game;

})(typeof global !== 'undefined' ? global : this);

