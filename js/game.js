//Keyboard keycodes
const KEY_CODE_L = 37;
const KEY_CODE_R = 39;
const KEY_CODE_S = 32;
//Gamebox dimensions
const GAME_WIDTH = 240;
const GAME_HEIGHT = 480;
//Player (Testa)
const PLAYER_WIDTH = 60;
const PLAYER_MAX_SPEED = 200;
//Bullets (Tesla logo)
const LASER_MAX_SPEED = 300;
const LASER_COOLDOWN = 0.3;
//Enemies
const ENEMIES_ROW = 5;
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

function rectsIntersect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function setPosition($el, x, y) {
  $el.style.transform = `translate(${x}px, ${y}px)`;
}

function clamp(v, min, max) {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}

//PLAYER SECTION
function createPlayer($container) {
  GAME_STATE.playerX = GAME_WIDTH / 2;
  GAME_STATE.playerY = GAME_HEIGHT - 40;
  const $player = document.createElement('img');
  $player.src = './assets/img/objects/car.png';
  $player.className = 'player';
  $container.appendChild($player);
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}
function updatePlayer(dt, $container) {
  if (GAME_STATE.leftPressed) {
    GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
  };
  if (GAME_STATE.rightPressed) {
    GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
  };

  GAME_STATE.playerX = clamp(GAME_STATE.playerX, PLAYER_WIDTH / 2, GAME_WIDTH - PLAYER_WIDTH / 2);

  if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
    createBullet($container, GAME_STATE.playerX, GAME_STATE.playerY);
    GAME_STATE.playerCooldown = LASER_COOLDOWN;
  }
  if (GAME_STATE.playerCooldown > 0) {
    GAME_STATE.playerCooldown -= dt;
  }

  const $player = document.querySelector('.player');
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

//BULLET SECTION
function createBullet($container, x, y) {
  const $element = document.createElement('img');
  $element.src = './assets/img/objects/bullet.png'
  $element.className = 'bullet';
  $container.appendChild($element);
  const bullet = { x, y, $element };
  GAME_STATE.bullets.push(bullet);
  setPosition($element, x, y);
  const audio = new Audio('../assets/sounds/laser.ogg');
  audio.play();
}
function updateBullets(dt, $container) {
  const bullets = GAME_STATE.bullets;
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.y -= dt * LASER_MAX_SPEED;
    if (bullet.y < 0) {
      destroyBullet($container, bullet);
    }
    setPosition(bullet.$element, bullet.x, bullet.y);
    const r1 = bullet.$element.getBoundingClientRect();
    const enemies = GAME_STATE.enemies;
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      if (enemy.isDead) continue;
      const r2 = enemy.$element.getBoundingClientRect();
      if (rectsIntersect(r1, r2)) {
        //Enemy hitted
        destroyEnemy($container, enemy);
        destroyBullet($container, bullet);
        break;
      }
    }
  }
  GAME_STATE.bullets = GAME_STATE.bullets.filter(e => !e.isDead);
}
function destroyBullet($container, bullet) {
  $container.removeChild(bullet.$element);
  bullet.isDead = true;
}

//ENEMY SECTION
let e420 = './assets/img/enemies/420.png';
let eShort = './assets/img/enemies/short.png';
let eCig = './assets/img/enemies/cig.png';
let enemiesImg = [e420, eShort, eCig];

function createEnemy($container, x, y) {
  const $element = document.createElement('img');
  $element.src = enemiesImg[Math.floor(Math.random() * 3)];
  $element.className = 'enemy';
  $container.appendChild($element);
  const enemy = { x, y, $element };
  GAME_STATE.enemies.push(enemy);
  setPosition($element, x, y);
}
function updateEnemies(dt, $container) {
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 20;

  const enemies = GAME_STATE.enemies;
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const x = enemy.x + dx;
    const y = enemy.y;
    setPosition(enemy.$element, x, y);
  }
  GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead)
}
function destroyEnemy($container, enemy) {
  $container.removeChild(enemy.$element);
  enemy.isDead = true;
  GAME_STATE.points += 1;
}


//MAIN SECTION
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

//UPDATE FUNCTION
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

function events() {
  //GETTING INPUT SECTION
  function keyDown(k) {
    if (k.keyCode === KEY_CODE_L) {
      GAME_STATE.leftPressed = true;
    } else if (k.keyCode === KEY_CODE_R) {
      GAME_STATE.rightPressed = true;
    } else if (k.keyCode === KEY_CODE_S) {
      GAME_STATE.spacePressed = true;
    }
  }

  function keyUp(k) {
    if (k.keyCode === KEY_CODE_L) {
      GAME_STATE.leftPressed = false;
    } else if (k.keyCode === KEY_CODE_R) {
      GAME_STATE.rightPressed = false;
    } else if (k.keyCode === KEY_CODE_S) {
      GAME_STATE.spacePressed = false;
    }
  }

  //Keyboard
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  //Buttons
  document.getElementById('leftB').addEventListener('touchstart', function () {
    GAME_STATE.leftPressed = true;
  });
  document.getElementById('leftB').addEventListener('touchend', function () {
    GAME_STATE.leftPressed = false;
  });
  document.getElementById('leftB').addEventListener('mousedown', function () {
    GAME_STATE.leftPressed = true;
  });
  document.getElementById('leftB').addEventListener('mouseup', function () {
    GAME_STATE.leftPressed = false;
  });
  document.getElementById('rightB').addEventListener('touchstart', function () {
    GAME_STATE.rightPressed = true;
  });
  document.getElementById('rightB').addEventListener('touchend', function () {
    GAME_STATE.rightPressed = false;
  });
  document.getElementById('rightB').addEventListener('mousedown', function () {
    GAME_STATE.rightPressed = true;
  });
  document.getElementById('rightB').addEventListener('mouseup', function () {
    GAME_STATE.rightPressed = false;
  });
  document.getElementById('spaceB').addEventListener('touchstart', function () {
    GAME_STATE.spacePressed = true;
  });
  document.getElementById('spaceB').addEventListener('touchend', function () {
    GAME_STATE.spacePressed = false;
  });
  document.getElementById('spaceB').addEventListener('mousedown', function () {
    GAME_STATE.spacePressed = true;
  });
  document.getElementById('spaceB').addEventListener('mouseup', function () {
    GAME_STATE.spacePressed = false;
  });
  // ------------------- //
}

events();
init();
window.requestAnimationFrame(update);