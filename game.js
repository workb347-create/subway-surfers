const WIDTH = 800;
const HEIGHT = 450;

let lanes = [250, 350, 450];
let currentLane = 1;
let speed = 300;
let score = 0;
let scoreText;
let gameOver = false;

class MenuScene extends Phaser.Scene {
  constructor() { super("Menu"); }

  create() {
    this.cameras.main.setBackgroundColor("#111");

    this.add.text(250, 120, "ENDLESS RUNNER", {
      fontSize: "40px",
      color: "#FFD700"
    });

    this.add.text(290, 200, "CLICK TO START", {
      fontSize: "24px",
      color: "#ffffff"
    });

    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super("Game"); }

  create() {
    gameOver = false;
    score = 0;
    currentLane = 1;

    this.cameras.main.setBackgroundColor("#222");

    // Player
    this.player = this.add.rectangle(150, lanes[currentLane], 40, 60, 0x00ffcc);
    this.physics.add.existing(this.player);
    this.player.body.setGravityY(800);
    this.player.body.setCollideWorldBounds(true);

    // Ground
    this.ground = this.add.rectangle(400, 420, 800, 60, 0x444444);
    this.physics.add.existing(this.ground, true);

    this.physics.add.collider(this.player, this.ground);

    // Groups
    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();

    // Score
    scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "20px",
      color: "#ffffff"
    });

    // Timers
    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => this.spawnObstacle()
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.spawnCoin()
    });

    // Collisions
    this.physics.add.overlap(this.player, this.obstacles, () => this.endGame(), null, this);
    this.physics.add.overlap(this.player, this.coins, (p, c) => {
      c.destroy();
      score += 50;
    });

    // Controls
    this.input.keyboard.on("keydown-UP", () => this.jump());
    this.input.keyboard.on("keydown-LEFT", () => this.moveLane(-1));
    this.input.keyboard.on("keydown-RIGHT", () => this.moveLane(1));

    this.input.on("pointerdown", (p) => {
      if (p.x < WIDTH / 2) this.moveLane(-1);
      else this.moveLane(1);
    });
  }

  update() {
    if (gameOver) return;

    score++;
    scoreText.setText("Score: " + score);

    this.obstacles.getChildren().forEach(o => {
      o.x -= speed * 0.016;
      if (o.x < -50) o.destroy();
    });

    this.coins.getChildren().forEach(c => {
      c.x -= speed * 0.016;
      if (c.x < -50) c.destroy();
    });
  }

  jump() {
    if (this.player.body.touching.down)
      this.player.body.setVelocityY(-450);
  }

  moveLane(dir) {
    currentLane = Phaser.Math.Clamp(currentLane + dir, 0, 2);
    this.player.y = lanes[currentLane];
  }

  spawnObstacle() {
    let lane = Phaser.Math.Between(0, 2);
    let obs = this.add.rectangle(850, lanes[lane], 40, 60, 0xff3333);
    this.physics.add.existing(obs);
    obs.body.setImmovable(true);
    this.obstacles.add(obs);
  }

  spawnCoin() {
    let lane = Phaser.Math.Between(0, 2);
    let coin = this.add.circle(850, lanes[lane] - 40, 10, 0xffd700);
    this.physics.add.existing(coin);
    this.coins.add(coin);
  }

  endGame() {
    gameOver = true;
    this.physics.pause();

    this.add.text(320, 200, "GAME OVER", {
      fontSize: "32px",
      color: "#ff0000"
    });

    this.add.text(300, 250, "CLICK TO RESTART", {
      fontSize: "20px",
      color: "#ffffff"
    });

    this.input.once("pointerdown", () => {
      this.scene.restart();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  physics: { default: "arcade" },
  scene: [MenuScene, GameScene]
};

new Phaser.Game(config);
