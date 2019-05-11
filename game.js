//GLOBAL HTML ELEMENT VARIABLES
const PLAYERS_URL = "https://sxcmbackend.herokuapp.com/players"
const GAMES_URL = "https://sxcmbackend.herokuapp.com/games"
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById('startButton');
const restartBtn = document.getElementById('restartButton');
const changeSpriteBtn = document.getElementById('changeSpriteButton');
const toggleSoundBtn = document.getElementById('toggleSoundButton');
const lifebar = document.getElementById("lifebar");
const gameDiv = document.getElementsByClassName('col-md-6')[0];
const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const playerStatsButton = document.getElementById('playerStatsButton');
const playerStats = document.getElementById('playerStats');
const playerStatsTable = document.getElementById('playerStatsTable');
const playerStatsTableBody = document.getElementById('playerStatsTableBody');
const leaderboardButton = document.getElementById('leaderboardButton');
const leaderboardTable = document.getElementById('leaderboardTable');
const leaderboardTableBody = document.getElementById('leaderboardTableBody');

//GAME VARIABLES
let username;
let currentPlayer;
let score = 0;
let cookieCount = 0;
let animating = false;
let lifeArr = ["♥️ ","♥️ ","♥️ "];
let request = window.requestAnimationFrame(draw);

//FLAVOR
//game graphics
let playerSprite = new Image();
playerSprite.src = "./assets/player.png";
let enemySprite1 = new Image();
enemySprite1.src = "./assets/enemy1.png";
let enemySprite2 = new Image();
enemySprite2.src = "./assets/enemy2.png";
let enemySprite3 = new Image();
enemySprite3.src = "./assets/enemy3.png";
let enemySprite4 = new Image();
enemySprite4.src = "./assets/enemy4.png";
let enemySprite5 = new Image();
enemySprite4.src = "./assets/enemy5.png";
let cookieSprite = new Image();
cookieSprite.src = "./assets/cookie.png";
let backgroundImg = new Image();
backgroundImg.src = "./assets/space2.jpg";
let gameOverScreen = new Image();
gameOverScreen.src = "./assets/gameover2.jpg";
let evans = false; // for sprite toggle
let sound = true;

//game audio
let cookieAudio = new Audio('./assets/cookie.mp3');
let hitAudio = new Audio('./assets/hit.mp3');
let startAudio = new Audio('./assets/start.wav');
let mainAudio = new Audio('./assets/main.mp3');
let loseAudio = new Audio('./assets/lose.wav');
/******************************************************************************
* EVENT LISTENERS
******************************************************************************/
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let userInput = usernameInput.value;
  // console.log(userInput)
  postToPlayers(userInput);
  startBtn.style.display = '';
  usernameForm.style.display = 'none';
});

startBtn.addEventListener('click', () => {
  canvas.style.display = '';
  startGame();
});

restartBtn.addEventListener('click', () => {
  restartGame();
});

changeSpriteBtn.addEventListener('click', () => {
  toggleSprite();
  alert("Sprite has been changed!");
});

toggleSoundBtn.addEventListener('click', () => {
  toggleSound();
});

document.addEventListener('keydown', (e) => {
  if (e.keyCode === 70) { //F button
    toggleSprite();
  }
});

playerStatsButton.addEventListener('click', e => {
  if (!currentPlayer) {
    alert("Please enter a username!");
  }
  else if (playerStatsTable.style.display === "none") {
    // console.log("I SHOW THE TABLE")
    playerStatsTable.style = "";
    getPlayerStats();
  } else {
    // console.log("I HIDE THE TABLE")
    playerStatsTable.style.display = "none";
  }
});

leaderboardButton.addEventListener('click', e => {
  if (leaderboardTable.style.display === "none") {
    // console.log("I SHOW THE TABLE")
    leaderboardTable.style = "";
    getLeaderboardStats();
  } else {
    // console.log("I HIDE THE TABLE")
    leaderboardTable.style.display = "none";
  }
});
//arrow key control
document.addEventListener("keydown", doKeyDown, true);
/******************************************************************************
* POINTER LOCK API for MOUSE CONTROL
******************************************************************************/
// pointer lock object forking for cross browser
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

canvas.onclick = function() {
  canvas.requestPointerLock();
};

// pointer lock event listeners
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas) {
    // console.log('The pointer lock status is now locked');
    document.addEventListener("mousemove", updatePosition, false);
  } else {
    // console.log('The pointer lock status is now unlocked');
    document.removeEventListener("mousemove", updatePosition, false);
  }
};

function updatePosition(e) {
  if (pX + e.movementX < 0 - pR || pX + e.movementX > canvas.width - pR) {
    // console.log('wall hit')
    pX += 0;
    // console.log(pX)
  } else {
    pX += e.movementX;
  };
  if (pY + e.movementY < 0 - pR || pY + e.movementY > canvas.height - pR) {
    // console.log('wall hit')
    pY += 0;
  } else {
    pY += e.movementY;
  };
};
/******************************************************************************
* API FETCH FUNCTIONS
******************************************************************************/
function postToPlayers(userInput) {
  // console.log('posting to players', userInput);
  fetch(PLAYERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      username: userInput
    })
  })//end of fetch
  .then(res => res.json())
  .then(playerObj => {
    // console.log(playerObj);
    currentPlayer = playerObj; // set current player
  })
};

function postToGames() {
  // console.log('posting to games');
  // console.log(currentPlayer);
  fetch(GAMES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      player_id: currentPlayer.id,
      public_score: score
    })
  })//end of fetch
};

function getPlayerStats() {
  // console.log("posting to the player");
  fetch(`http://localhost:3000/players/${currentPlayer.id}`)
    .then(resp => resp.json())
    .then(player => {
      playerStatsTableBody.innerHTML = ``
      let gameNumber;
      if (player.games.length < 10) {
        gameNumber = 1
        player.games.forEach(game => {
          playerStatsTableBody.innerHTML += `
            <tr>
              <td>${gameNumber}</td>
              <td>${sanitizeDate(game.created_at)}</td>
              <td>${game.public_score}</td>
            </tr>
          `;
          gameNumber += 1;
        })
      } else {
        gameNumber = player.games.length-10;
        player.games.slice(player.games.length-10, player.games.length).forEach(game => {
          playerStatsTableBody.innerHTML += `
            <tr>
              <td>${gameNumber}</td>
              <td>${sanitizeDate(game.created_at)}</td>
              <td>${game.public_score}</td>
            </tr>
          `;
        gameNumber += 1;
        })
      }
    })//then ends here
};

function getLeaderboardStats() {
  fetch(GAMES_URL)
    .then(resp => resp.json())
    .then(array => {
      let sortedArray = array.sort( (a, b) => {
        return (a.public_score > b.public_score) ? -1 : 1;
      })
      return sortedArray;
    })
    .then(leaderboardArray => {
      leaderboardTableBody.innerHTML = ``;
      let rank = 1;
      leaderboardArray.slice(0, 10).forEach(player => {
        leaderboardTableBody.innerHTML += `
          <tr>
            <td>${rank}</td>
            <td>${player.player.username}</td>
            <td>${player.public_score}</td>
          </tr>
        `;
        rank += 1;
      })
    })
};
/******************************************************************************
* GAME FUNCTIONS
******************************************************************************/
function startGame() {
  // startAudio.play();
  // mainAudio.play();
  lifebar.style.display = '';
  scorebar.style.display = '';
  startBtn.style.display = 'none';
  animating = true;
  renderScore();
  renderLife(lifeArr);
  timeScore();
  return request;
};

//increase score by 10 / s
function timeScore() {
  setInterval(() => {
    score += 10
    renderScore();
  }, 1000)
};

function restartGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  restartBtn.style.display = 'none';
  resetGame();
  startGame();
};

function toggleSprite() {
  evans = !evans;
  if(evans) {
    // console.log('evans');
    if(Math.random() < 0.33 ) {
      return playerSprite.src = "./assets/evans.png";
    } else if (Math.random() < 0.66 ) {
      return playerSprite.src = "./assets/evans2.png";
    } else {
      return playerSprite.src = "./assets/evans3.png";
    }
  } else {
    // console.log('cookiemonster');
    return playerSprite.src = "./assets/player.png";
  }
};

function toggleSound() {
  sound = !sound;
  if (sound) {
    cookieAudio.muted = true
    hitAudio.muted = true
    mainAudio.muted = true
    startAudio.muted = true
    loseAudio.muted = true
    alert('Sound has been turned off')
  } else {
    cookieAudio.muted = false
    hitAudio.muted = false
    mainAudio.muted = false
    startAudio.muted = false
    loseAudio.muted = false
    alert('Sound has been turned on')
  }
};

function renderLife(lifeArr) {
  lifebar.innerHTML = 'Life:';
  lifeArr.forEach(life => {
    lifebar.innerHTML += life;
  })
};

function renderScore() {
  scorebar.innerHTML = `Score: ${score}`;
};

function playerHit() {
  // console.log('hit');
  lifeArr.pop();
  if(lifeArr.length > 0) {
    hitAudio.play();
  }
  renderLife(lifeArr);
  if(lifeArr.length === 0) {
    loseAudio.play();
    gameOver();
  }
};

function eatCookie() {
  // console.log('++');
  cookieCount += 1;
  // console.log(cookieCount);
  score += 100;
  renderScore();
  // console.log(score);
  if (cookieCount === 10) {
    lifeArr.push("♥️")
    renderLife(lifeArr);
    cookieCount = 0;
  }
};

function gameOver() {
  animating = false;
  // document.dispatchEvent( evt );
  postToGames();
  restartBtn.style.display = '';
  // alert(`YOUR SCORE: ${score}`);
};

function resetGame() {
  score = 0;
  cookieCount = 0;
  lifeArr = ["♥️","♥️","♥️"];
  pX = canvas.width/2;
  pY = canvas.height/2;
  enemies = [];
  cookies = [];
};

function appendPlayerStats() {
  return playerStatsTableBody.innerHTML += `
    <tr>
      <td>${gameNumber}</td>
      <td>${sanitizeDate(game.created_at)}</td>
      <td>${game.public_score}</td>
    </tr>
  `
};
//format date start
function sanitizeDate(string) {
  // console.log(string.slice(5,7))
  let month_number = parseInt(string.slice(5,7), 10)
  let year = string.slice(0,4)
  let date = parseInt(string.slice(8,10), 10)
  let month_name;
  if (month_number === 1) {
    month_name = "January"
  }
  else if (month_number === 2) {
    month_name = "February"
  }
  else if (month_number === 3) {
    month_name = "March"
  }
  else if (month_number === 4) {
    month_name = "April"
  }
  else if (month_number === 5) {
    month_name = "May"
  }
  else if (month_number === 6) {
    month_name = "June"
  }
  else if (month_number === 7) {
    month_name = "July"
  }
  else if (month_number === 8) {
    month_name = "August"
  }
  else if (month_number === 9) {
    month_name = "September"
  }
  else if (month_number === 10) {
    month_name = "October"
  }
  else if (month_number === 11) {
    month_name = "November"
  }
  else if (month_number === 12) {
    month_name = "December"
  }
  return `${month_name} ${date}, ${year}`
};//format date end
/******************************************************************************
* PLAYER CANVAS ELEMENT
******************************************************************************/
let pR = 14;
let pX = canvas.width/2;
let pY = canvas.height/2;
let pDx = 5;
let pDy = 5;

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(pX, pY, pR, 0, Math.PI*2);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fill();
  ctx.closePath();
  ctx.drawImage(playerSprite, pX, pY, 40, 40);
};

//direction keys
let direction = {};
function doKeyDown(e) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  onkeydown = onkeyup = function(e) {
    direction[e.keyCode] = e.type == 'keydown';
  }

  if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
  e.preventDefault();
  }
};
/******************************************************************************
* ENEMY CANVAS ELEMENT
******************************************************************************/
let enemySpawnRate = 2000;
let enemyLastSpawn = Date.now()+1000;
let enemies = [];

//spawn code starts here
function spawnEnemy() {
  let t;
  //randomize obj color
  if (Math.random() < 0.2) {
    t = enemySprite1;
  } else if (Math.random() < 0.4) {
    t = enemySprite2;
  } else if (Math.random() < 0.6) {
    t = enemySprite3;
  } else if (Math.random() < 0.8) {
    t = enemySprite4;
  } else {
    t = enemySprite5;
  }

  let object = {
    type: t,
    x: Math.random() < 0.5 ? pX + Math.random() * 300 : pX - Math.random() * 300,
    y: Math.random() < 0.5 ? pY + Math.random() * 300 : pY - Math.random() * 300,
    r: 8,
    dx: Math.random()*2,
    dy: Math.random()*2,
  }
  enemies.push(object);
}; //spawn code ends here

//to prevent objects from getting stuck
function removeObj(o) {
  o.x = canvas.width + 100;
  o.y = canvas.hieght + 100;
};

function bounceLogic(o) {
  if (o.y + o.dy < 0 || o.y + o.dy > canvas.height) {
    o.dy = -o.dy;
  };

  if (o.x + o.dx < 0 || o.x + o.dx > canvas.width) {
    o.dx = -o.dx;
  };
};

function cooldownLogic(o, player) {
  if (player.cooldown === false ) {
    // console.log('HIT');
    playerHit(); //function to decrease player life
    removeObj(o); //remove enemy element upon collision
    player.cooldown = true;
    setTimeout(()=> player.cooldown === false, 500); //0.5s collision off
  };
};

//draw enemy obj loop for animate function
function enemyLoop(player) {
  for(let i = 0; i < enemies.length; i++) {

    let o = enemies[i];
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI*2);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();
    ctx.closePath();
    ctx.drawImage(o.type, o.x, o.y, 30, 30);

    //collision code
    //distance between midpoints
    let dx = o.x - player.x;
    let dy = o.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if(distance < player.r + o.r) {
      cooldownLogic(o, player); //invulnerability timer
      o.dx = -o.dx;
      o.dy = -o.dy;
      // console.log('hit');
    };

    //direction on spawn
    if (o.x + o.dx > canvas.width-o.r || o.x + o.dx < o.r) {
      o.dx = -o.dx;
    };
    if (o.y + o.dy > canvas.height-o.r || o.y + o.dy < o.r) {
      o.dy = -o.dy;
    };

    bounceLogic(o);
    o.x += o.dx;
    o.y += o.dy;
  }
};
/******************************************************************************
* COOKIE CANVAS ELEMENT
******************************************************************************/
let cookieSpawnRate = 5000;
let cookieDespawnRate = 7000;
let cookieLastSpawn = Date.now()+1000;
let cookies = [];

function spawnCookie() {
  let cookie = {
    x: Math.random() * (canvas.width - 30) + 15,
    y: Math.random() * (canvas.height - 50) + 25,
    r: 10,
  }
  cookies.push(cookie);
};

function despawnCookie(c) { //currently displaces cookie out of view of canvas
  setTimeout(() => c.x = -100, cookieDespawnRate);
  setTimeout(() => c.y = -100, cookieDespawnRate);
};

//draw cookie loop for animate function
function cookieLoop(player) {
  for(let i = 0; i < cookies.length; i++) {

    let c = cookies[i];
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();
    ctx.closePath();
    ctx.drawImage(cookieSprite, c.x, c.y, 20, 20);

    despawnCookie(c);

    let dx = c.x - player.x;
    let dy = c.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if(distance <= player.r + c.r) {
    // console.log("++");
      c.x = -1000;
      c.y = -1000;
      eatCookie();
      cookieAudio.play();
    }
  }
};
/******************************************************************************
* ANIMATE AND DRAW FUNCTIONS
******************************************************************************/
//animate code
function animate() {
  let time = Date.now();
  if (time > (enemyLastSpawn + enemySpawnRate)) {
    enemyLastSpawn = time;
    spawnEnemy();
  }

  if (time > (cookieLastSpawn + cookieSpawnRate)) {
    cookieLastSpawn = time;
    spawnCookie();
  }

  let player = { r: pR, x: pX, y: pY, cooldown: false };
  enemyLoop(player);
  cookieLoop(player);
};

//main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg,
    canvas.width/2-backgroundImg.width/2,
    canvas.height/2-backgroundImg.height/2,
    backgroundImg.width,
    backgroundImg.height
  );

  if (animating) { //in play
    mainAudio.play();
    animate();
    drawPlayer();
  } else { //gameover
    mainAudio.pause();
    ctx.drawImage(
      gameOverScreen,
      canvas.width/2-gameOverScreen.width/6,
      canvas.height/2-gameOverScreen.height/6,
      gameOverScreen.width/3,
      gameOverScreen.height/3
    );
    lifebar.style.display = 'none';
    scorebar.style.display = 'none';
    resetGame();
  }
  //arrow key control code included here for smooth movemement
  //Up and left
  if (direction[38] && direction[37]) {
    if (pY > pR && pX > pR) {
      pY -= pDy;
      pX -= pDx;
    }
  }
  //Down and left
  else if (direction[40] && direction[37]) {
    if (pY < canvas.height - pR && pX > pR) {
      pY += pDy;
      pX -= pDx;
    }
  }
  //Up and right
  else if (direction[38] && direction[39]) {
    if (pY > pR && pX < canvas.width - pR) {
      pY -= pDy;
      pX += pDx;
    }
  }
  //Down and right
  else if (direction[40] && direction[39]) {
    if (pY < canvas.height - pR && pX < canvas.width - pR) {
      pY += pDy;
      pX += pDx;
    }
  }
  //Up
  else if (direction[38]) {
    if (pY > pR) {
      pY -= pDy;
    }
  }
  //Down
  else if (direction[40]) {
    if (pY < canvas.height - pR) {
      pY += pDy;
    }
  }
  //Left
  else if (direction[37]) {
    if (pX > pR) {
      pX -= pDx;
    }
  }
  //Right
  else if (direction[39]) {
    if (pX < canvas.width - pR) {
      pX += pDx;
    }
  }
  window.requestAnimationFrame(draw);
};//main draw end
