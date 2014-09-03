var width = Math.min(window.innerWidth, 640);
var height = Math.min(window.innerHeight, 480);
var game = new Phaser.Game(width, 480, Phaser.AUTO, 'game');

var mainState = {
	preload: function() {
		// load required assets:
		game.load.image('astronaut', 'assets/astronaut.png');
		game.load.image('asteroid', 'assets/asteroid.png');
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
	}
}

game.state.add('main', mainState);
game.state.start('main');
