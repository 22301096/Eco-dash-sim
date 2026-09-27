"use strict";

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const keys = new Set();

window.addEventListener("keydown", event => {
  keys.add(event.key.toLowerCase());

  if (event.code === "Space") {
    event.preventDefault();
    game.togglePause();
  }

  if (event.key.toLowerCase() === "r") {
    game.restart();
  }
});

window.addEventListener("keyup", event => {
  keys.delete(event.key.toLowerCase());
});

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  multiply(value) {
    this.x *= value;
    this.y *= value;
    return this;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  limit(maximum) {
    const length = this.length();

    if (length > maximum) {
      this.x = this.x / length * maximum;
      this.y = this.y / length * maximum;
    }

    return this;
  }
}

class Player {
  constructor() {
    this.radius = 17;
    this.reset();
  }

  reset() {
    this.position = new Vector(115, 120);
    this.velocity = new Vector();
    this.angle = 0;
    this.battery = 100;
    this.distance = 0;
    this.damageCooldown = 0;
  }

  update(deltaTime, wind) {
    const acceleration = 0.22;
    const drag = 0.94;
    const maximumSpeed = 3.8;

    let directionX = 0;
    let directionY = 0;

    if (keys.has("arrowleft") || keys.has("a")) directionX -= 1;
    if (keys.has("arrowright") || keys.has("d")) directionX += 1;
    if (keys.has("arrowup") || keys.has("w")) directionY -= 1;
    if (keys.has("arrowdown") || keys.has("s")) directionY += 1;

    if (directionX || directionY) {
      const directionLength = Math.hypot(directionX, directionY);
      directionX /= directionLength;
      directionY /= directionLength;

      this.angle = Math.atan2(directionY, directionX);

      // Trigonometric directional acceleration.
      this.velocity.x += Math.cos(this.angle) * acceleration;
      this.velocity.y += Math.sin(this.angle) * acceleration;
    }

    this.velocity.x += wind.x * deltaTime;
    this.velocity.y += wind.y * deltaTime;
    this.velocity.multiply(drag).limit(maximumSpeed);

    const previousPosition = new Vector(this.position.x, this.position.y);

    this.position.add(new Vector(
      this.velocity.x * deltaTime * 60,
      this.velocity.y * deltaTime * 60
    ));

    this.position.x = Math.max(this.radius, Math.min(WIDTH - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(HEIGHT - this.radius, this.position.y));

    const travelled = Math.hypot(
      this.position.x - previousPosition.x,
      this.position.y - previousPosition.y
    );

    this.distance += travelled;
    this.battery -= travelled * 0.006 * deltaTime * 60;
    this.damageCooldown = Math.max(0, this.damageCooldown - deltaTime);
  }

  recharge(deltaTime) {
    this.battery = Math.min(100, this.battery + 18 * deltaTime);
  }

  draw() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.angle);

    context.fillStyle = "#ecf6e7";
    context.strokeStyle = "#183d2c";
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(23, 0);
    context.lineTo(-15, -13);
    context.lineTo(-10, 0);
    context.lineTo(-15, 13);
    context.closePath();
    context.fill();
    context.stroke();

    context.fillStyle = "#36c56b";
    context.fillRect(-10, -4, 19, 8);

    context.fillStyle = "#f5b942";
    context.beginPath();
    context.arc(4, 0, 4, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}

class Obstacle {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }

  draw() {
    context.save();

    if (this.type === "river") {
      context.fillStyle = "#318aa1";
      context.fillRect(this.x, this.y, this.width, this.height);

      context.strokeStyle = "#81d1d1";
      for (let y = this.y + 12; y < this.y + this.height; y += 18) {
        context.beginPath();
        context.moveTo(this.x + 8, y);
        context.lineTo(this.x + this.width - 8, y);
        context.stroke();
      }
    } else if (this.type === "pothole") {
      context.fillStyle = "#493526";
      context.beginPath();
      context.ellipse(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        0, 0, Math.PI * 2
      );
      context.fill();
    } else if (this.type === "tree") {
      context.strokeStyle = "#633d25";
      context.lineWidth = 12;
      context.beginPath();
      context.moveTo(this.x, this.y + this.height);
      context.lineTo(this.x + this.width, this.y);
      context.stroke();

      context.fillStyle = "#295e3c";
      context.beginPath();
      context.arc(this.x + 10, this.y + 8, 19, 0, Math.PI * 2);
      context.arc(this.x + this.width - 8, this.y + this.height - 8, 17, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillStyle = "#dd7847";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = "#ffe5a2";
      context.fillText("WORK", this.x + 8, this.y + 18);
    }

    context.restore();
  }
}

class SolarStation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 42;
  }

  draw(isActive) {
    context.save();
    context.globalAlpha = isActive ? 1 : .38;

    context.fillStyle = "#eebc4c";
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#244f43";
    context.fillRect(this.x - 25, this.y - 13, 50, 26);
    context.strokeStyle = "#a7e1ca";
    context.strokeRect(this.x - 25, this.y - 13, 50, 26);

    context.fillStyle = "#183d2c";
    context.font = "12px Arial";
    context.textAlign = "center";
    context.fillText(isActive ? "SOLAR" : "OFF", this.x, this.y + 4);
    context.restore();
  }
}

class Particle {
  constructor(x, y) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(Math.random() * 1.5 - .75, Math.random() * -1.5);
    this.life = 1;
    this.size = Math.random() * 4 + 2;
  }

  update(deltaTime) {
    this.position.add(this.velocity);
    this.life -= deltaTime * 1.8;
  }

  draw() {
    context.globalAlpha = Math.max(0, this.life);
    context.fillStyle = "#d99a58";
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  }
}

class Game {
  constructor() {
    this.player = new Player();
    this.station = new SolarStation(180, 535);
    this.destination = { x: 960, y: 105, radius: 32 };
    this.obstacles = [];
    this.particles = [];
    this.state = "start";
    this.score = 0;
    this.timeRemaining = 120;
    this.weather = "Clear";
    this.weatherTimer = 0;
    this.lastTime = 0;
    this.loadShedding = false;

    this.createWorld();
    this.bindButtons();
    this.updateBestScore();
    requestAnimationFrame(time => this.loop(time));
  }

  createWorld() {
    this.obstacles = [
      new Obstacle(360, 80, 240, 32, "river"),
      new Obstacle(470, 420, 150, 28, "river"),
      new Obstacle(270, 260, 45, 30, "pothole"),
      new Obstacle(720, 220, 50, 35, "pothole"),
      new Obstacle(625, 105, 95, 28, "tree"),
      new Obstacle(790, 430, 120, 35, "construction"),
      new Obstacle(400, 530, 95, 30, "tree")
    ];
  }

  bindButtons() {
    document.getElementById("startButton").onclick = () => this.start();
    document.getElementById("resumeButton").onclick = () => this.togglePause();
    document.getElementById("pauseButton").onclick = () => this.togglePause();
    document.getElementById("restartButton").onclick = () => this.restart();
    document.getElementById("playAgainButton").onclick = () => this.start();
  }

  start() {
    this.player.reset();
    this.score = 0;
    this.timeRemaining = 120;
    this.weather = "Clear";
    this.weatherTimer = 0;
    this.loadShedding = false;
    this.particles = [];
    this.state = "playing";

    this.hideScreens();
    this.updateHud();
  }

  restart() {
    if (this.state !== "start") this.start();
  }

  togglePause() {
    if (this.state === "playing") {
      this.state = "paused";
      document.getElementById("pauseScreen").classList.add("active");
    } else if (this.state === "paused") {
      this.state = "playing";
      document.getElementById("pauseScreen").classList.remove("active");
    }
  }

  hideScreens() {
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  }

  update(deltaTime) {
    this.timeRemaining -= deltaTime;
    this.weatherTimer += deltaTime;

    if (this.weatherTimer > 18) {
      this.weatherTimer = 0;
      const weatherOptions = ["Clear", "Rain", "Dust Storm"];
      this.weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    }

    this.loadShedding = Math.floor(this.timeRemaining) % 30 >= 22;

    const wind = this.weather === "Dust Storm"
      ? new Vector(.045, -.02)
      : new Vector(0, 0);

    this.player.update(deltaTime, wind);

    const insideStation = Math.hypot(
      this.player.position.x - this.station.x,
      this.player.position.y - this.station.y
    ) < this.station.radius;

    if (insideStation && !this.loadShedding) {
      this.player.recharge(deltaTime);
    }

    this.handleCollisions();

    if (this.weather === "Dust Storm" && Math.random() < .35) {
      this.particles.push(new Particle(this.player.position.x, this.player.position.y + 12));
    }

    this.particles.forEach(particle => particle.update(deltaTime));
    this.particles = this.particles.filter(particle => particle.life > 0);

    const reachedDestination = Math.hypot(
      this.player.position.x - this.destination.x,
      this.player.position.y - this.destination.y
    ) < this.destination.radius + this.player.radius;

    if (reachedDestination) {
      this.score = Math.max(0, Math.round(
        1000 + this.timeRemaining * 8 + this.player.battery * 5 -
        this.player.distance * .3
      ));
      this.finish(true);
    }

    if (this.timeRemaining <= 0 || this.player.battery <= 0) {
      this.finish(false);
    }

    this.updateHud();
  }

  handleCollisions() {
    for (const obstacle of this.obstacles) {
      if (this.circleIntersectsRectangle(this.player, obstacle)) {
        if (this.player.damageCooldown <= 0) {
          this.player.battery = Math.max(0, this.player.battery - 8);
          this.player.velocity.multiply(-.45);
          this.player.damageCooldown = 1;
          this.score = Math.max(0, this.score - 40);
        }
      }
    }
  }

  circleIntersectsRectangle(circle, rectangle) {
    const nearestX = Math.max(rectangle.x, Math.min(circle.position.x, rectangle.x + rectangle.width));
    const nearestY = Math.max(rectangle.y, Math.min(circle.position.y, rectangle.y + rectangle.height));
    const distanceX = circle.position.x - nearestX;
    const distanceY = circle.position.y - nearestY;

    return distanceX ** 2 + distanceY ** 2 < circle.radius ** 2;
  }

  finish(success) {
    this.state = "gameover";

    if (success) {
      this.saveBestScore();
    }

    document.getElementById("resultTitle").textContent = success
      ? "Delivery Complete!"
      : "Mission Failed";

    document.getElementById("resultMessage").textContent = success
      ? "The clinic received its medical supplies."
      : "The drone could not complete the delivery.";

    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("gameOverScreen").classList.add("active");
  }

  updateHud() {
    const battery = Math.round(this.player.battery);

    document.getElementById("batteryText").textContent = `${battery}%`;
    document.getElementById("batteryBar").style.width = `${battery}%`;
    document.getElementById("score").textContent = this.score;
    document.getElementById("distance").textContent = (this.player.distance / 100).toFixed(1);
    document.getElementById("weather").textContent = this.loadShedding
      ? "Load-shedding"
      : this.weather;
    document.getElementById("timer").textContent = Math.max(0, Math.ceil(this.timeRemaining));

    document.getElementById("batteryBar").style.background =
      battery < 25 ? "#dc594b" : "#35c46a";
  }

  saveBestScore() {
    const best = Number(localStorage.getItem("ecodashBestScore") || 0);

    if (this.score > best) {
      localStorage.setItem("ecodashBestScore", String(this.score));
    }

    this.updateBestScore();
  }

  updateBestScore() {
    document.getElementById("bestScore").textContent =
      localStorage.getItem("ecodashBestScore") || "0";
  }

  drawBackground() {
    context.fillStyle = "#dcb875";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "#c99b57";
    context.beginPath();
    context.moveTo(0, 150);
    context.lineTo(180, 80);
    context.lineTo(350, 155);
    context.lineTo(520, 65);
    context.lineTo(720, 155);
    context.lineTo(900, 70);
    context.lineTo(WIDTH, 150);
    context.lineTo(WIDTH, 0);
    context.lineTo(0, 0);
    context.fill();

    context.fillStyle = "#a87943";
    context.beginPath();
    context.moveTo(0, 420);
    context.quadraticCurveTo(220, 320, 450, 430);
    context.quadraticCurveTo(700, 520, WIDTH, 365);
    context.lineTo(WIDTH, HEIGHT);
    context.lineTo(0, HEIGHT);
    context.fill();

    context.fillStyle = "#39734b";
    for (let x = 35; x < WIDTH; x += 85) {
      context.beginPath();
      context.arc(x, 610 - (x % 40), 20, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "#203f31";
    context.font = "bold 14px Arial";
    context.fillText("RURAL CLINIC", 920, 70);
  }

  drawDestination() {
    context.fillStyle = "#f5b942";
    context.beginPath();
    context.arc(this.destination.x, this.destination.y, this.destination.radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#214b3b";
    context.fillRect(this.destination.x - 18, this.destination.y - 13, 36, 28);
    context.fillStyle = "#e9f5dc";
    context.fillRect(this.destination.x - 5, this.destination.y - 5, 10, 20);
  }

  drawRain() {
    if (this.weather !== "Rain") return;

    context.strokeStyle = "#bce5ed99";
    context.lineWidth = 2;

    for (let index = 0; index < 100; index++) {
      const x = (index * 83 + performance.now() * .15) % WIDTH;
      const y = (index * 47 + performance.now() * .4) % HEIGHT;

      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - 6, y + 15);
      context.stroke();
    }
  }

  draw() {
    this.drawBackground();
    this.station.draw(!this.loadShedding);
    this.drawDestination();

    this.obstacles.forEach(obstacle => obstacle.draw());
    this.particles.forEach(particle => particle.draw());
    this.player.draw();
    this.drawRain();

    if (this.loadShedding) {
      context.fillStyle = "#301e1eaa";
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.fillStyle = "#ffd47a";
      context.font = "bold 20px Arial";
      context.fillText("LOAD-SHEDDING: SOLAR STATION OFFLINE", 350, 35);
    }
  }

  loop(currentTime) {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000 || 0, .05);
    this.lastTime = currentTime;

    if (this.state === "playing") {
      this.update(deltaTime);
    }

    this.draw();
    requestAnimationFrame(time => this.loop(time));
  }
}

const game = new Game();