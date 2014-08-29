var width = Math.min(window.innerWidth, 640);
var height = Math.min(window.innerHeight, 480);
var game = new Phaser.Game(width, 480, Phaser.AUTO, 'game');

var mainState = {
	preload: function() {
		// load required assets:
		game.load.image('astronaut', 'assets/astronaut.png');
		game.load.image('asteroid', 'assets/asteroid.png');
		game.load.image('nova', 'assets/nova.png');
		game.load.image('gravityray', 'assets/gravityray.png');
	},
	create: function() {
		// enable arcade physics:
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// create gravity ray between astronaut and closest asteroid:
		this.gravityRay = game.add.sprite(0, 0, 'gravityray');
		this.gravityRay.anchor.setTo(0, 0.5);
		this.gravityRay.visible = false;

		// (randomly) place asteroids and add to group:
		this.asteroids = game.add.group();
		for (var i = 0; i < 7; i++) {
			var asteroid = game.add.sprite(
				game.rnd.integerInRange(100, game.world.width - 100),
				game.rnd.integerInRange(100, game.world.height - 100),
				'asteroid');
			asteroid.anchor.setTo(0.5, 0.5);
			game.physics.enable(asteroid, Phaser.Physics.ARCADE);
			this.asteroids.add(asteroid);
		};


		// (randomly) place novae and add to group:
		this.novae = game.add.group();
		for (var i = 0; i < 3; i++) {
			var nova = game.add.sprite(
				game.rnd.integerInRange(100, game.world.width - 100),
				game.rnd.integerInRange(100, game.world.height - 100),
				'nova');
			nova.anchor.setTo(0.5, 0.5);
			this.novae.add(nova);
		};

		// create astronaut at the center of the world:
		this.astronaut = game.add.sprite(game.world.width * 0.5, game.world.height * 0.5, 'astronaut');
		this.astronaut.anchor.setTo(0.5, 0.5);
		game.physics.enable(this.astronaut, Phaser.Physics.ARCADE);
	},
	update: function() {
		// determine the closest asteroid and its distance to the player:
		var distance = Number.MAX_VALUE;
		var closestAsteroid;
		this.asteroids.forEach(function(ast){
			var tempDistance = game.physics.arcade.distanceBetween(ast, this.astronaut);
			if(tempDistance < distance){
				distance = tempDistance;
				closestAsteroid = ast;
			}
		}, this);

		// if the closest asteroid is too far off, restart the game (or: show game over screen):
		if(distance > 250){
			game.state.start('main');
		}

		// if the player activates the controls...
		if(game.input.activePointer.isDown){
			// ...accelerate astronaut to the closest asteroid:
			var force = Math.min(30, 30 * (1 - distance / 250));
			game.physics.arcade.accelerateToObject(this.astronaut, closestAsteroid, force);

			// ...rotate astronaut correspondingly:
			this.astronaut.rotation = game.physics.arcade.angleBetween(this.astronaut, closestAsteroid);

			// ...show, place, rotate, and scale the gravity ray between the astronaut and the closest asteroid:
			this.gravityRay.visible = true;
			this.gravityRay.x = this.astronaut.x;
			this.gravityRay.y = this.astronaut.y;
			this.gravityRay.rotation = game.physics.arcade.angleBetween(this.astronaut, closestAsteroid);
			this.gravityRay.width = distance - closestAsteroid.width * 0.5;
			this.gravityRay.height = Math.min(15, 15 * (1 - distance / 250));
		} else {
			// deactivate acceleration and hide gravity ray:
			game.physics.arcade.accelerateToObject(this.astronaut, closestAsteroid, 0);
			this.gravityRay.visible = false;
		}

		// check collision between player and novae:
		this.novae.forEach(function(nova){
			if(this.collidesRectCircle(this.astronaut, nova)){
				game.state.start('main');
			}
		}.bind(this));
	},
	/* 
	 * Determines whether two circles collide or not.
	 * Input: 
	 * - rect: an Arcade physics body with centered anchor
	 * - circle: a square Arcade physics bodies with centered anchor
	 * Output:
	 * - true, if collision is detected
	 * - false, if no collision is detected
	 */
	collidesRectCircle: function(rect, circle){
		var radius = circle.width * 0.5;
		var upperRectRadius = Math.max(rect.width, rect.height) * 0.75;

		// quick check, whether collision is actually possible:
		if(Math.abs(circle.x - rect.x) < radius + upperRectRadius &&
			Math.abs(circle.y - rect.y) < radius + upperRectRadius){

			// adjust radians:
			var rotation = rect.rotation > 0 ? -1 * rect.rotation : -1 * rect.rotation + Math.PI;

			// rotate circle around origin of the rectangle:
			var rotatedCircleX = Math.cos(rotation) * (circle.x - rect.x) - 
					Math.sin(rotation) * (circle.y - rect.y) + rect.x;
			var rotatedCircleY  = Math.sin(rotation) * (circle.x - rect.x) + 
					Math.cos(rotation) * (circle.y - rect.y) + rect.y;

			// get upper left position of the rectangle:
			var rectX = rect.x - (rect.width * 0.5);
			var rectY = rect.y - (rect.height * 0.5);

			// find closest point in the rectangle to the rotated circle's center:
			var closestX, closestY;

			if (rotatedCircleX  < rectX){
				closestX = rectX;
			} else if (rotatedCircleX  > rectX + rect.width){
				closestX = rectX + rect.width;
			} else {
				closestX = rotatedCircleX;
			}

			if (rotatedCircleY < rectY){
				closestY = rectY;
			} else if (rotatedCircleY > rectY + rect.height) {
				closestY = rectY + rect.height;
			} else {
				closestY = rotatedCircleY;
			}

			// check distance between closest point and rotated circle's center:
			var distance = this.getPowDistance(rotatedCircleX, rotatedCircleY, closestX, closestY);
			if (distance < radius * radius){
				return true; // collision detected!
			}
		}
		return false;
	},
	getPowDistance: function(fromX, fromY, toX, toY){
		var a = Math.abs(fromX - toX);
		var b = Math.abs(fromY - toY);
		return (a * a) + (b * b);
	}
}

game.state.add('main', mainState);
game.state.start('main');
