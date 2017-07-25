
(function(global) {

	let _IMAGE = null;

	(function() {

		let img = new Image();

		img.onload = function() {
			_IMAGE = this;
		};

		img.src = './source/Plane.png';

	})();



	const Plane = function(data) {

		this.x      = 64;
		this.y      = 254;
		this.width  = 40;
		this.height = 32;

		this.alive    = true;
		this.gravity  = 0;
		this.velocity = 0.30;

	};

	Plane.prototype = {

		jump: function() {
			this.gravity = -6;
		},

		render: function(context) {

			let width  = this.width;
			let height = this.height;


			context.save();

			context.translate(
				this.x,
				this.y
			);

			context.rotate(Math.PI / 2 * this.gravity / 20);

			if (_IMAGE !== null) {

				context.drawImage(
					_IMAGE,
					-1 / 2 * width,
					-1 / 2 * height,
					width,
					height
				);

			}

			context.restore();

		},

		update: function(game) {

			// Gravity is in Y direction
			// Plane never moves in X direction
			// (Game moves Goals, not Planes)
			this.gravity += this.velocity;
			this.y       += this.gravity;


			let x  = this.x;
			let y  = this.y;
			let hw = this.width  / 2;
			let hh = this.height / 2;


			// Plane moves outside Game Field
			// - dies if flapped too high
			// - dies if gravity caused crash
			if (y >= game.height || y <= 0) {
				this.alive = false;
			}


			if (this.alive === true) {

				// AABB collisions for Plane with each Goal
				for (let g = 0, gl = game.goals.length; g < gl; g++) {

					let goal = game.goals[g];
					let ghw  = goal.width  / 2;
					let ghh  = goal.height / 2;

					// XXX: Boxes are 40px each
					// but game will be too hard to solve
					// let ghh  = (goal.height - 80) / 2;

					let min_x = goal.x - ghw;
					let max_x = goal.x + ghw;
					let min_y = goal.y - ghh;
					let max_y = goal.y + ghh;

					if (x + hw > min_x && x - hw < max_x) {

						if (y - hh > min_y && y + hh < max_y) {
							// this.alive = true;
						} else {
							this.alive = false;
							break;
						}

					}

				}

			}

		}

	};


	global.Plane = Plane;

})(typeof global !== 'undefined' ? global : this);

