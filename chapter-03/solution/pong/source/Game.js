
(function(global) {

	let _CANVAS  = null;
	let _CONTEXT = null;


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



	const _get_closest_ball = function(paddle) {

		let balls = this;
		let px    = paddle.x;
		let py    = paddle.y;
		let found = null;
		let fdist = Infinity;


		balls.forEach(function(ball) {

			let dx   = ball.x - px;
			let dy   = ball.y - py;
			let dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

			if (dist < fdist) {
				found = ball;
				fdist = dist;
			}

		});


		return found;

	};



	const Game = function() {

		this.balls   = [];
		this.paddles = [];
		this.fps     = 60;

		this.width      = _CANVAS.width;
		this.height     = _CANVAS.height;
		this.population = [];
		this.training   = [];

		this._has_ended  = false;
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

			let population = this.population;
			if (population.length > 0) {

				// Autobattle Mode

				this.balls = [
					new Ball()
				];

				this.paddles = this.population.map(function(agent) {
					return new Paddle({ type: 'auto' });
				});

			} else {

				// Manual Mode

				this.balls = [
					new Ball()
				];

				this.paddles = [
					new Paddle({ type: 'manual' }),
					new Paddle({ type: 'auto'   })
				];

				this.population = [
					null,
					new Agent()
				];

			}


			// Sweet statistics and stuff
			this._info.alive = this.paddles.length;
			this._info.score = 0;

			// Seed-based Randomizer is IMPORTANT
			// - used only for Ball Velocity generation
			// - this allows identical level structure
			// - still random, but in same order
			// - Math.random() will lead to worse performance
			// - Math.random() will let NNs not learn so efficiently

			this._randomizer = new Twister(1337);

			this.restart();

		},

		restart: function(learn) {

			let that = this;
			let info = this._info;


			if (learn === true) {

				this.paddles.forEach(function(paddle, p) {

					let agent        = that.population[p] || null;
					let closest_ball = _get_closest_ball.call(that.balls, paddle);

					if (agent !== null && closest_ball !== null) {

						let inputs  = [
							paddle.x / that.width,
							paddle.y / that.height,
							closest_ball.x / that.width,
							closest_ball.y / that.height,
							closest_ball.vx / 25,
							closest_ball.vy / 25
						];
						let outputs = [ closest_ball.y / that.height ];

						agent.learn(inputs, outputs);


						that.training.push({
							inputs:  inputs,
							outputs: outputs
						});

					}

				});


				this.training.forEach(function(knowledge, k) {

					that.population.forEach(function(agent, a) {

						if (agent !== null) {
							agent.learn(knowledge.inputs, knowledge.outputs);
						}

					});

				});

			}


			this.balls.forEach(function(ball, b) {

				ball.x     = that.width  / 2;
				ball.y     = that.height / 2;
				ball.alive = true;
				ball.trail = [];

			});

			this.paddles.forEach(function(paddle, p) {

				if (p % 2 === 0) {
					paddle.x = 60;
				} else {
					paddle.x = that.width - 60;
				}

				paddle.y = that.height / 2;

			});


			info.generation++;
			info.highscore = Math.max(info.score, info.highscore);
			info.score     = 0;


			this.balls.forEach(function(ball, b) {

				let rx = that._randomizer.random();
				let ry = that._randomizer.random();

				ball.vx = rx > 0.5 ? 8 : -8;
				ball.vy = (ry * 2 - 1) * 8;

			});

		},

		pause: function() {
			this._has_ended = true;
		},

		resume: function() {

			if (this._has_ended === true) {

				this._has_ended = false;

				this.update();
				this.render();

			}

		},

		stop: function() {
			this._has_ended = true;
		},

		render: function() {

			let context = _CONTEXT;
			let info    = this._info;
			let balls   = this.balls;
			let paddles = this.paddles;


			context.fillStyle = '#404552';
			context.fillRect(0, 0, this.width, this.height);


			for (let b = 0, bl = balls.length; b < bl; b++) {

				let ball = balls[b];
				if (ball.alive === true) {
					ball.render(context);
				}

			}

			for (let p = 0, pl = paddles.length; p < pl; p++) {
				paddles[p].render(context);
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
			let balls      = this.balls;
			let paddles    = this.paddles;
			let population = this.population;
			let training   = this.training;


			let alive_balls = 0;

			for (let b = 0, bl = balls.length; b < bl; b++) {

				let ball = balls[b];

				if (ball.alive === true) {
					ball.update(this);
				}

				if (ball.alive === true) {
					alive_balls++;
				}

			}

			for (let p = 0, pl = paddles.length; p < pl; p++) {

				let agent        = population[p] || null;
				let paddle       = paddles[p];
				let closest_ball = _get_closest_ball.call(balls, paddle);

				if (agent !== null && closest_ball !== null) {

					// Brain Computation
					// - First Sensor is relative Paddle Position
					// - Second Sensor is relative Ball Position
					// - Output is "To Move Up or Down or Do Nothing"

					let inputs  = [
						paddle.x / this.width,
						paddle.y / this.height,
						closest_ball.x / this.width,
						closest_ball.y / this.height,
						closest_ball.vx / 25,
						closest_ball.vy / 25
					];
					let result  = agent.compute(inputs);

					let rel_pos = paddle.y / this.height;
					if ((rel_pos - result) > 0.1) {
						paddle.move('up');
					} else if ((rel_pos - result) < 0.1) {
						paddle.move('down');
					} else {
						paddle.move('left');
					}


					// IMPORTANT:
					// - update Paddle position _AFTERWARDS_
					// - if FPS > 60, this allows hard
					//   computation cycles for slow machines

					let hit_something = paddle.update(this);
					if (hit_something === true) {

						info.score++;


						let outputs = [ closest_ball.y / this.height ];

						agent.learn(inputs, outputs);


						training.push({
							inputs:  inputs,
							outputs: outputs
						});

					}

				} else {

					// IMPORTANT:
					// - update Paddle position _AFTERWARDS_
					// - if FPS > 60, this allows hard
					//   computation cycles for slow machines

					paddle.update(this);

				}

			}


			if (alive_balls === 0) {
				this.restart(true);
			}


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

