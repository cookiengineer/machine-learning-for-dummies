
(function(global) {

	let _IMAGE_BLUE = null;
	let _IMAGE_RED  = null;

	(function() {

		let img1 = new Image();
		let img2 = new Image();

		img1.onload = function() {
			_IMAGE_BLUE = this;
		};

		img2.onload = function() {
			_IMAGE_RED = this;
		};

		img1.src = './source/Paddle.blue.png';
		img2.src = './source/Paddle.red.png';

	})();


	const Paddle = function(data) {

		this.x = 0;
		this.y = 0;

		this.width    = 30;
		this.height   = 128;
		this.type     = 'manual';
		this.velocity = 0;

		if (data instanceof Object) {
			Object.assign(this, data);
		}

	};

	Paddle.prototype = {

		move: function(direction) {

			if (direction === 'up') {
				this.velocity = -6;
			} else if (direction === 'down') {
				this.velocity =  6;
			} else if (direction === 'left' || direction === 'right') {
				this.velocity =  0;
			}

		},

		render: function(context) {

			let image = (this.type === 'manual' ? _IMAGE_BLUE : _IMAGE_RED) || null;
			if (image !== null) {

				context.drawImage(
					image,
					this.x - 1 / 2 * this.width,
					this.y - 1 / 2 * this.height,
					this.width,
					this.height
				);

			}

		},

		update: function(game) {

			this.y += this.velocity;


			let x  = this.x;
			let y  = this.y;
			let hw = this.width  / 2;
			let hh = this.height / 2;


			// Paddle moves outside Game Field
			// - clamp if moved too far down
			// - clamp if moved too far up
			if (y + hh >= game.height) {
				this.y        = game.height - hh;
				this.velocity = 0;
			} else if (y - hh <= 0) {
				this.y        = hh;
				this.velocity = 0;
			}


			let hit_something = false;

			// AABB/radius collisions for Paddle with each Ball
			for (let b = 0, bl = game.balls.length; b < bl; b++) {

				let ball = game.balls[b];
				if (ball.last_hit === this) {
					continue;
				}


				// AABB Collision (Circle/Rectangle)
				// - don't need real physics here
				// - pong uses faked collisions with inverted ball velocity
				// - make game harder over time by accelerating ball
				// - dont make game so fast that we can't play it anymore

				let br     = ball.radius;
				let coll_x = (ball.x + br >= x - hw) && (ball.x - br <= x + hw);
				let coll_y = (ball.y + br >= y - hh) && (ball.y - br <= y + hh);

				if (coll_x && coll_y) {

					if (x < ball.x) {
						ball.x = x + 16;
					} else {
						ball.x = x - 16;
					}

					if (Math.abs(ball.vx) < 25) {

						ball.vx = -1.1 * ball.vx;

						if (ball.vx < 0) {
							ball.vx = Math.max(ball.vx, -25);
						} else if (ball.vx > 0) {
							ball.vx = Math.min(ball.vx,  25);
						}

					} else {

						ball.vx = -1 * ball.vx;

					}

					ball.last_hit = this;
					hit_something = true;

				}

			}


			return hit_something;

		}

	};


	global.Paddle = Paddle;

})(typeof global !== 'undefined' ? global : this);

