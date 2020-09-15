// Keyboard keycodes, they are stored as constants to avoid unnecessary hard coding
const KEY_CODE_LEFT = 37; // LEFT ARROW KEY (move left)
const KEY_CODE_RIGHT = 39; // RIGHT ARROW KEY (move right)
const KEY_CODE_SPACE = 32; // SPACE KEY (shoot)
// Gamebox dimensions, all dimensions are in pixels
const GAME_WIDTH = 240;
const GAME_HEIGHT = 480;
//Player (Tesla)
const PLAYER_WIDTH = 60;
const PLAYER_MAX_SPEED = 200; // Speed is defined in pixels per second
// Bullets (Tesla logo)
const LASER_MAX_SPEED = 300;
const LASER_COOLDOWN = 0.3;
// Enemies
const ENEMIES_ROW = 5; // Number of enemies per row
const ENEMY_HORIZONTAL_PADDING = 40;
const ENEMY_VERTICAL_PADDING = 60;
const ENEMY_VERTICAL_SIZE = 50;
// Level parameters
const Q_ENEMIES_LVL_1 = 5; // Quantity of enemies on level 1
const S_ENEMIES_LVL_1 = 50; // Speed of enemies on level 1

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
  lives: 5,
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
  const $player = document.createElement("img");
  $player.src = "./assets/img/objects/car.png";
  $player.className = "player";
  $container.appendChild($player);
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// UPDATE PLAYER
// This function takes care of updating the player's game state
function updatePlayer(dt, $container) {
  if (GAME_STATE.leftPressed) {
    // If left arrow key is pressed
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
  GAME_STATE.playerX = clamp(
    GAME_STATE.playerX,
    PLAYER_WIDTH / 2,
    GAME_WIDTH - PLAYER_WIDTH / 2
  );

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
  const $player = document.querySelector(".player");
  // Set new player position
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// [ BULLET SECTION ]

// CREATE BULLET
function createBullet($container, x, y) {
  // Creates image element and assigns it the correct png and class
  const $element = document.createElement("img");
  $element.src = "./assets/img/objects/bullet.png";
  $element.className = "bullet";
  $container.appendChild($element);
  // Creates a constant containing position and bullet element
  const bullet = { x, y, $element };
  // Said constant gets added to the other bullets stored in game state
  GAME_STATE.bullets.push(bullet);
  // Sets the bullet position
  setPosition($element, x, y);
  // Loads sound effect
  const audio = new Audio("./assets/sounds/laser.ogg");
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
        // Adds one point
        GAME_STATE.points += 1;
        break;
      }
    }
  }
  // Stores in the game state all the bullets that are still in game.
  // This means bullets that have not hit anything or that have gone
  // out of bounds.
  GAME_STATE.bullets = GAME_STATE.bullets.filter((e) => !e.isDead);
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
let e420 = "./assets/img/enemies/420.png"; // 420 image
let eShort = "./assets/img/enemies/short.png"; // SHORT image
let eCig = "./assets/img/enemies/cig.png"; // CIGARETTE image
let enemiesImg = [e420, eShort, eCig]; // Array of enemy images

// CREATE ENEMIES
function createEnemy($container, x, y) {
  // Creates an image element and assigns a random src image and a predetermined class
  const $element = document.createElement("img");
  // Chooses random image
  $element.src = enemiesImg[Math.floor(Math.random() * 3)];
  $element.className = "enemy";
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
  //dy allow the enemy to drop himself down to the player.
  const dy = dt * S_ENEMIES_LVL_1;

  // Gets all the enemies inside of game state and puts all of them in a constant
  const enemies = GAME_STATE.enemies;
  // For each enemy
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    // Change the x position by adding dx
    const x = enemy.x;
    // Change the y position by adding dy
    const y = (enemy.y += dy);
    if (y > GAME_HEIGHT) {
      // Destroy enemy
      destroyEnemy($container, enemy);
      // Remove one life
      GAME_STATE.lives -= 1;
    }
    // Sets new position
    setPosition(enemy.$element, x, y);
  }

  // Updates the game state by filtering and eliminating all the dead enemies
  GAME_STATE.enemies = GAME_STATE.enemies.filter((e) => !e.isDead);
}

// DESTROY ENEMY
function destroyEnemy($container, enemy) {
  // Removes the enemy
  $container.removeChild(enemy.$element);
  // Sets its state to dead
  enemy.isDead = true;
}

// [ MAIN SECTION ]

// INIT
// Initializer function, to be called on load
function init() {
  // Selects the container
  const $container = document.querySelector('.game');
  // Creates the player
  createPlayer($container);

  // Array that stores all the x coordinates to avoid repetition
  var arrX = [];

  // For the quantity of enemies on level 1
  for (let i = 0; i < Q_ENEMIES_LVL_1; i++) {
    // Distance from the top
    const y = 25 + Math.floor(Math.random() * 30);
    // X coordinate
    var x = 0;
    // Validity flag
    var isValid = false;

    if (i > 0) {
      isValid = false;
      while (!isValid) {
        var isGood = 0;
        x = 40 + Math.floor(Math.random() * 160);
        for (let j = 0; j < arrX.length; j++) {
          if (Math.abs(arrX[j] - x) > 15) {
            isGood++;
          }
        }
        if (isGood == arrX.length) {
          isValid = true;
        }
      }
    } else {
      // Set a random x coordinate
      x = 40 + Math.floor(Math.random() * 160);
    }
    arrX.push(x);
    // Create an enemy at the previously set x and y coordinates
    createEnemy($container, x, y);
  }

  // Gets the points HTML element
  const $points = document.getElementById('game-points');
  // Displays the news value
  $points.innerHTML = GAME_STATE.points;

  // Gets the number of lives HTML elements
  const $lives = document.getElementById('game-lives');
  // Displays the new value
  $lives.innerHTML = GAME_STATE.lives;
}

// UPDATE FUNCTION
// This function runs every frame
function update() {
  const curretTime = Date.now();
  // Calculates the time difference between the last frame and this one
  const dt = (curretTime - GAME_STATE.lastTime) / 1000;

  // Selects the game container and updates the whole game
  const $container = document.querySelector(".game");
  updatePlayer(dt, $container);
  updateBullets(dt, $container);
  updateEnemies(dt, $container);

  // Updates the points display
  const $points = document.getElementById("game-points");
  $points.innerHTML = GAME_STATE.points;

  // Sets the last frame timestamp as the current one before requesting new frame
  const $lives = document.getElementById("game-lives");
  $lives.innerHTML = GAME_STATE.lives;

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
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
  //Buttons
  document
    .getElementById("leftB")
    .addEventListener("touchstart", function() {
      GAME_STATE.leftPressed = true;
    });
  document.getElementById("leftB").addEventListener("touchend", function() {
    GAME_STATE.leftPressed = false;
  });
  document.getElementById("leftB").addEventListener("mousedown", function() {
    GAME_STATE.leftPressed = true;
  });
  document.getElementById("leftB").addEventListener("mouseup", function() {
    GAME_STATE.leftPressed = false;
  });
  document
    .getElementById("rightB")
    .addEventListener("touchstart", function() {
      GAME_STATE.rightPressed = true;
    });
  document.getElementById("rightB").addEventListener("touchend", function() {
    GAME_STATE.rightPressed = false;
  });
  document
    .getElementById("rightB")
    .addEventListener("mousedown", function() {
      GAME_STATE.rightPressed = true;
    });
  document.getElementById("rightB").addEventListener("mouseup", function() {
    GAME_STATE.rightPressed = false;
  });
  document
    .getElementById("spaceB")
    .addEventListener("touchstart", function() {
      GAME_STATE.spacePressed = true;
    });
  document.getElementById("spaceB").addEventListener("touchend", function() {
    GAME_STATE.spacePressed = false;
  });
  document
    .getElementById("spaceB")
    .addEventListener("mousedown", function() {
      GAME_STATE.spacePressed = true;
    });
  document.getElementById("spaceB").addEventListener("mouseup", function() {
    GAME_STATE.spacePressed = false;
  });
  // ------------------- //
}

events();
init();
window.requestAnimationFrame(update);


// ScoreBoard Login //
const SCOREBOARD_SERVER_IP = "http://15.161.0.103"; //Url of the backend server

function setScore(score, name) {
  var xhttp = new XMLHttpRequest();
  xhttp.open(
    "POST",
    SCOREBOARD_SERVER_IP + `/setScore.php?score=${score}&name=${name}`,
    true
  );
  xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
}

function getScoreBorad() {
  var xmlhttp = new XMLHttpRequest();
  var url = SCOREBOARD_SERVER_IP + `/getScoreBoard.php`;

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var myArr = JSON.parse(this.responseText);
      console.log(myArr.data);
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}