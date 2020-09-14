//Keyboard keycodes, they are stored as constants to avoid unnecessary hard coding
const KEY_CODE_LEFT = 37; // LEFT ARROW KEY (move left)
const KEY_CODE_RIGHT = 39; // RIGHT ARROW KEY (move right)
const KEY_CODE_SPACE = 32; // SPACE KEY (shoot)
//Gamebox dimensions, all dimensions are in pixels
const GAME_WIDTH = 240;
const GAME_HEIGHT = 480;
//Player (Tesla)
const PLAYER_WIDTH = 60;
const PLAYER_MAX_SPEED = 200; // Speed is defined in pixels per second
//Bullets (Tesla logo)
const LASER_MAX_SPEED = 300;
const LASER_COOLDOWN = 0.3;
//Enemies
const ENEMIES_ROW = 5; // Number of enemies per row
const ENEMY_HORIZONTAL_P = 40;
const ENEMY_VERTICAL_P = 60;
const ENEMY_VERTICAL_S = 50;

//GAME PROPERTIES
const GAME_STATE = {
  lastTime: Date.now(),
  leftPressed: false,
  rightPressed: false,
  spacePressed: false,
  playerX: 0,
  playerY: 0,
  playerCooldown: 0,
  bullets: [],
  enemies: [],
  points: 0,
  lives: 5
};

// CHECK RECTANGLES INTERSECTION
function rectsIntersect(r1, r2) {
  // If the edges of the rectangles are not touching, return false
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

// SET POSITION
function setPosition($el, x, y) {
  // Sets the position using the CSS translate
  $el.style.transform = `translate(${x}px, ${y}px)`;
}

// CLAMP FUNCTION
// It returns a value based on the inputs such that the return value is
// within the minimum and maximum values given as parameters
function clamp(v, min, max) {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}

// [ PLAYER SECTION ]

// CREATE PLAYER FUNCTION
function createPlayer($container) {
  GAME_STATE.playerX = GAME_WIDTH / 2;
  GAME_STATE.playerY = GAME_HEIGHT - 40;
  const $player = document.createElement('img');
  $player.src = './assets/img/objects/car.png';
  $player.className = 'player';
  $container.appendChild($player);
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// UPDATE PLAYER
// This function takes care of updating the player's game state
function updatePlayer(dt, $container) {
  if (GAME_STATE.leftPressed) { // If left arrow key is pressed
    // Change x position by a set number of pixels based on time elapsed since last update
    GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
  }
  // If left arrow key is pressed
  if (GAME_STATE.rightPressed) {
    // Change x position by a set number of pixels based on time elapsed since last update
    GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
  }

  // Passes the calculated value made by the if statements above to the clamp function
  // with the purpose of checking if the value is within the game area boundaries
  GAME_STATE.playerX = clamp(GAME_STATE.playerX, PLAYER_WIDTH / 2, GAME_WIDTH - PLAYER_WIDTH / 2);

  // If the space key is pressed and the shooting cooldown time has elapsed
  if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
    // Create bullet
    createBullet($container, GAME_STATE.playerX, GAME_STATE.playerY);
    // Set the shooting cooldown value to preconfigured number
    GAME_STATE.playerCooldown = LASER_COOLDOWN;
  }
  // If the shooting cooldown time has not elapsed
  // NOTE: this if statement and the one above are completely independent
  if (GAME_STATE.playerCooldown > 0) {
    // Subtract elapsed time to player cooldown
    GAME_STATE.playerCooldown -= dt;
  }

  // Select player element from document
  const $player = document.querySelector('.player');
  // Set new player position
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// [ BULLET SECTION ]

// CREATE BULLET
function createBullet($container, x, y) {
  // Creates image element and assigns it the correct png and class
  const $element = document.createElement('img');
  $element.src = './assets/img/objects/bullet.png'
  $element.className = 'bullet';
  $container.appendChild($element);
  // Creates a constant containing position and bullet element
  const bullet = { x, y, $element };
  // Said constant gets added to the other bullets stored in game state
  GAME_STATE.bullets.push(bullet);
  // Sets the bullet position
  setPosition($element, x, y);
  // Loads sound effect
  const audio = new Audio('./assets/sounds/laser.ogg');
  // Plays sound effect
  audio.play();
}

// UPDATE BULLETS
function updateBullets(dt, $container) {
  // Takes all the bullets stored in the game state
  // and stores them inside of a constant
  const bullets = GAME_STATE.bullets;
  // For each bullet
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    // Calculates the new y position based on preset speed and time elapsed
    bullet.y -= dt * LASER_MAX_SPEED;
    // If the bullet reaches the border of the game area it gets destroyed
    if (bullet.y < 0) {
      destroyBullet($container, bullet);
    }
    // Set the bullet's position
    setPosition(bullet.$element, bullet.x, bullet.y);
    // Get size and position relative to viewport of bullet
    const r1 = bullet.$element.getBoundingClientRect();
    // Gets all the enemies stored in game state
    const enemies = GAME_STATE.enemies;
    // For each enemy
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      // Check if the enemy is dead
      if (enemy.isDead) continue;
      // Get size and position relative to viewport of enemy
      const r2 = enemy.$element.getBoundingClientRect();
      // If enemy rectangle and bullet rectangle intersect
      if (rectsIntersect(r1, r2)) {
        // Destroy enemy and bullet
        destroyEnemy($container, enemy);
        destroyBullet($container, bullet);
        break;
      }
    }
  }
  // Stores in the game state all the bullets that are still in game.
  // This means bullets that have not hit anything or that have gone
  // out of bounds.
  GAME_STATE.bullets = GAME_STATE.bullets.filter(e => !e.isDead);
}

// DESTROY BULLET
function destroyBullet($container, bullet) {
  // Removes bullet element
  $container.removeChild(bullet.$element);
  // Sets the bullet's state to dead
  bullet.isDead = true;
}

// [ ENEMY SECTION ]

// ENEMY IMAGES
let e420 = './assets/img/enemies/420.png'; // 420 image
let eShort = './assets/img/enemies/short.png'; // SHORT image
let eCig = './assets/img/enemies/cig.png'; // CIGARETTE image
let enemiesImg = [e420, eShort, eCig]; // Array of enemy images

// CREATE ENEMIES
function createEnemy($container, x, y) {
  // Creates an image element and assigns a random src image and a predetermined class
  const $element = document.createElement('img');
  // Chooses random image
  $element.src = enemiesImg[Math.floor(Math.random() * 3)];
  $element.className = 'enemy';
  $container.appendChild($element);
  // Creates a constant with the enemy's position and element
  const enemy = { x, y, $element };
  // Pushes the enemy to game state
  GAME_STATE.enemies.push(enemy);
  // Sets the enemy's position
  setPosition($element, x, y);
}

// UPDATE ENEMIES
function updateEnemies(dt, $container) {
  // dx is the difference in the x coordinate since the last update
  // Through this formula it allows for the movement of the enemies
  // to oscillate back and forth thanks to the sinusoidal movement
  // of the sine function.
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 20;

  // Gets all the enemies inside of game state and puts all of them in a constant
  const enemies = GAME_STATE.enemies;
  // For each enemy
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    // Change the x position by adding dx
    const x = enemy.x + dx;
    // The y coordinate remains unchanged
    const y = enemy.y;
    // Sets new position
    setPosition(enemy.$element, x, y);
  }

  // Updates the game state by filtering and eliminating all the dead enemies
  GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead)
}

// DESTROY ENEMY
function destroyEnemy($container, enemy) {
  // Removes the enemy
  $container.removeChild(enemy.$element);
  // Sets its state to dead
  enemy.isDead = true;
  // Adds one point
  GAME_STATE.points += 1;
}

// [ MAIN SECTION ]

// INIT
// Initializer function, to be called on load
function init() {
  const $container = document.querySelector('.game');
  createPlayer($container);

  const enemySpacing = (GAME_WIDTH - ENEMY_HORIZONTAL_P * 2) / (ENEMIES_ROW - 1);
  for (let j = 0; j < 3; j++) {
    const y = ENEMY_VERTICAL_P + j * ENEMY_VERTICAL_S;
    for (let i = 0; i < ENEMIES_ROW; i++) {
      const x = i * enemySpacing + ENEMY_HORIZONTAL_P;
      createEnemy($container, x, y);
    }
  }

  const $points = document.getElementById('game-points');
  $points.innerHTML = GAME_STATE.points;

  const $lives = document.getElementById('game-lives');
  $lives.innerHTML = GAME_STATE.lives;
}

// UPDATE FUNCTION
function update() {
  const curretTime = Date.now();
  const dt = (curretTime - GAME_STATE.lastTime) / 1000;

  const $container = document.querySelector('.game');
  updatePlayer(dt, $container);
  updateBullets(dt, $container);
  updateEnemies(dt, $container);

  const $points = document.getElementById('game-points');
  $points.innerHTML = GAME_STATE.points;

  GAME_STATE.lastTime = curretTime;
  window.requestAnimationFrame(update);
}

// EVENTS
// To be called on load, it stores all the button press events
function events() {
  //GETTING INPUT SECTION
  function keyDown(k) {
    if (k.keyCode === KEY_CODE_LEFT) {
      GAME_STATE.leftPressed = true;
    } else if (k.keyCode === KEY_CODE_RIGHT) {
      GAME_STATE.rightPressed = true;
    } else if (k.keyCode === KEY_CODE_SPACE) {
      GAME_STATE.spacePressed = true;
    }
  }

  function keyUp(k) {
    if (k.keyCode === KEY_CODE_LEFT) {
      GAME_STATE.leftPressed = false;
    } else if (k.keyCode === KEY_CODE_RIGHT) {
      GAME_STATE.rightPressed = false;
    } else if (k.keyCode === KEY_CODE_SPACE) {
      GAME_STATE.spacePressed = false;
    }
  }

  //Keyboard
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  //Buttons
  document.getElementById('leftB').addEventListener('touchstart', function() {
    GAME_STATE.leftPressed = true;
  });
  document.getElementById('leftB').addEventListener('touchend', function() {
    GAME_STATE.leftPressed = false;
  });
  document.getElementById('leftB').addEventListener('mousedown', function() {
    GAME_STATE.leftPressed = true;
  });
  document.getElementById('leftB').addEventListener('mouseup', function() {
    GAME_STATE.leftPressed = false;
  });
  document.getElementById('rightB').addEventListener('touchstart', function() {
    GAME_STATE.rightPressed = true;
  });
  document.getElementById('rightB').addEventListener('touchend', function() {
    GAME_STATE.rightPressed = false;
  });
  document.getElementById('rightB').addEventListener('mousedown', function() {
    GAME_STATE.rightPressed = true;
  });
  document.getElementById('rightB').addEventListener('mouseup', function() {
    GAME_STATE.rightPressed = false;
  });
  document.getElementById('spaceB').addEventListener('touchstart', function() {
    GAME_STATE.spacePressed = true;
  });
  document.getElementById('spaceB').addEventListener('touchend', function() {
    GAME_STATE.spacePressed = false;
  });
  document.getElementById('spaceB').addEventListener('mousedown', function() {
    GAME_STATE.spacePressed = true;
  });
  document.getElementById('spaceB').addEventListener('mouseup', function() {
    GAME_STATE.spacePressed = false;
  });
  // ------------------- //
}

events();
init();
window.requestAnimationFrame(update);