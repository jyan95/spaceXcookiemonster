/******************************************************************************
* cookie canvas element
******************************************************************************/
let cookieSpawnRate = 10000;
let cookieLastSpawn = Date.now()+1000;
let cookies = [];

function spawnCookie() {
  let object = {
    type: 'green',
    x: Math.random() * (canvas.width - 30) + 15,
    y: Math.random() * (canvas.height - 50) + 25,
    r: 3,
  }
  cookies.push(object);
};

//draw cookie loop for animate function
function cookieLoop(player) {
  for(let i = 0; i < cookies.length; i++) {

    let c = cookies[i];
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.closePath();

    let dx = c.x - player.x;
    let dy = c.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if(distance <= player.r + c.r){
      c.x = null;
      c.y = null;
      // increaseScore();
      console.log("++");
    }
  }
};
