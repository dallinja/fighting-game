const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const GRAVITY = 0.7;

const background = new Sprite({
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  x: 600,
  y: 128,
  width: 300,
  height: 300,
  scale: 2.75,
  imageSrc: "./img/shop.png",
  frames: 6,
});

const playerOne = new Player({
  x: 200,
  y: 0,
  width: 50,
  height: 150,
  color: "blue",
  attackBox: { offset: { x: 100, y: 50 }, width: 150, height: 50 },
  spriteScale: 2.5,
  spriteOffset: { x: 215, y: 152 },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      frames: 8,
      framesHold: 7,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      frames: 8,
      framesHold: 7,
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      frames: 2,
      framesHold: 7,
    },
    fall: {
      imageSrc: "./img/samuraiMack/Fall.png",
      frames: 2,
      framesHold: 7,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      frames: 6,
      framesHold: 5,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/TakeHitWhite.png",
      frames: 4,
      framesHold: 5,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      frames: 6,
      framesHold: 5,
    },
  },
});

const playerTwo = new Player({
  x: 800,
  y: 20,
  width: 50,
  height: 150,
  color: "red",
  keys: {
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: "ArrowUp",
    attack: "ArrowDown",
  },
  facing: "left",
  attackBox: { offset: { x: -170, y: 50 }, width: 150, height: 50 },
  spriteScale: 2.5,
  spriteOffset: { x: 215, y: 167 },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      frames: 4,
      framesHold: 10,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      frames: 8,
      framesHold: 7,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      frames: 2,
      framesHold: 10,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      frames: 2,
      framesHold: 10,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      frames: 4,
      framesHold: 10,
    },
    takeHit: {
      imageSrc: "./img/kenji/TakeHit.png",
      frames: 3,
      framesHold: 5,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      frames: 7,
      framesHold: 5,
    },
  },
});

let play = true;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  background.update();
  shop.update();

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  playerOne.update();
  playerTwo.update();

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: playerOne.attackBox,
      rectangle2: playerTwo,
    }) &&
    playerOne.isAttacking &&
    playerOne.framesCurrent === 4
  ) {
    playerTwo.takeHit();
    playerOne.isAttacking = false;

    const playerTwoHealth = document.getElementById("playerTwoHealth");
    playerTwoHealth.style.width = Math.max(playerTwo.health, 0) + "%";
  }
  // if player misses
  if (playerOne.isAttacking && playerOne.framesCurrent === 4) {
    playerOne.isAttacking = false;
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: playerTwo.attackBox,
      rectangle2: playerOne,
    }) &&
    playerTwo.isAttacking &&
    playerTwo.framesCurrent === 2
  ) {
    playerOne.takeHit();
    playerTwo.isAttacking = false;

    const playerOneHealth = document.getElementById("playerOneHealth");
    playerOneHealth.style.width = Math.max(playerOne.health, 0) + "%";
  }
  // if player misses
  if (playerTwo.isAttacking && playerTwo.framesCurrent === 2) {
    playerTwo.isAttacking = false;
  }

  // end game based on health
  if (playerTwo.health <= 0 || (playerOne.health <= 0 && play)) {
    determineWinner({ playerOne, playerTwo, timerId });
  }

  // if (play) {
  requestAnimationFrame(animate);
  // }
}

animate();

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.x + rectangle1.width >= rectangle2.x &&
    rectangle1.x <= rectangle2.x + rectangle2.width &&
    rectangle1.y + rectangle1.height >= rectangle2.y &&
    rectangle1.y <= rectangle2.y + rectangle2.height
  );
}

function determineWinner({ playerOne, playerTwo, timerId }) {
  clearTimeout(timerId);
  document.querySelector("#displayText").style.display = "flex";
  if (playerOne.health === playerTwo.health) {
    document.querySelector("#displayText").innerHTML = "Tie";
  } else if (playerOne.health > playerTwo.health) {
    document.querySelector("#displayText").innerHTML = "Player 1 Wins";
  } else if (playerOne.health < playerTwo.health) {
    document.querySelector("#displayText").innerHTML = "Player 2 Wins";
  }
  play = false;
  playerOne.unmount();
  playerTwo.unmount();
}

let timer = 60;
let timerId;
function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  }

  if (timer === 0) {
    determineWinner({ playerOne, playerTwo, timerId });
  }
}
decreaseTimer();
