
(function(global) {

	const Ball = function(data) {

		this.x  = 0;
		this.y  = 0;
		this.vx = 0;
		this.vy = 0;

		this.last_hit = null;
		this.radius   = 8;
		this.trail    = [];

		this._t     = 0;
		this._count = 0;

		if (data instanceof Object) {
			Object.assign(this, data);
		}

	};


	Ball.prototype = {

		render: function(context) {

			let radius = this.radius;
			let trail  = this.trail;


			context.beginPath();
			context.fillStyle = '#f6336d';
			context.arc(
				this.x,
				this.y,
				radius,
				0,
				2 * Math.PI
			);
			context.fill();


			for (let t = trail.length - 1, tl = trail.length; t >= 0; t--) {

				let pos = trail[t];
				let a   = t / tl;

				context.globalAlpha = a * 0.5;
				context.beginPath();
				context.fillStyle = '#f6336d';
				context.arc(
					pos.x,
					pos.y,
					a * radius,
					0,
					2 * Math.PI
				);
				context.fill();

			}


			context.globalAlpha = 1;

		},

		update: function(game) {

			this.x += this.vx;
			this.y += this.vy;

			let x = this.x;
			let y = this.y;
			let r = this.radius;


			if (x - r <= 0) {
				this.alive    = false;
				this.last_hit = null;
			} else if (x + r >= game.width) {
				this.alive    = false;
				this.last_hit = null;
			}

			if (y - r <= 0) {
				this.y        = r;
				this.vy       = -1 * this.vy;
				this.last_hit = null;
			} else if (y + r >= game.height) {
				this.y        = game.height - r;
				this.vy       = -1 * this.vy;
				this.last_hit = null;
			}


			this._count++;


			if (this._count > 2) {


				if (this.trail.length < 8) {

					this.trail.push({ x: this.x, y: this.y });

				} else {

					let pos = this.trail.splice(0, 1);

					pos.x = this.x;
					pos.y = this.y;

					this.trail.push(pos);

				}


				this._count = 0;

			}

		}

	};


	global.Ball = Ball;

})(typeof global !== 'undefined' ? global : this);

