// for wip purposes
/******************************************************************************
* player canvas element
******************************************************************************/
let pR = 10;
let pX = canvas.width/2;
let pY = canvas.height/2;
let pDx = 5;
let pDy = 5;

function drawPlayer(){
  ctx.beginPath();
  ctx.arc(pX, pY, pR, 0, Math.PI*2);
  ctx.fillStyle = "orange";
  ctx.fill();
  ctx.closePath();
};

//direction keys
let direction = {};
function doKeyDown(e){
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  onkeydown = onkeyup = function(e){
    direction[e.keyCode] = e.type == 'keydown';
    // console.log(direction):
    /* insert conditional here */
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
  }
};

document.addEventListener("keydown", doKeyDown, true)
// setInterval(drawPlayer, 5)
