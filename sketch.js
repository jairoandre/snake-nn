const gridSize = 20;
const gameSize = 600;
const population = 1;


let snake;
let snakes;
let lastUpdate;
let dirCommitted = true;
let velocitySlider;
let populationSlider;
let sketchBestSnake;
let totalFitness;

function newGame() {
  snake = new Snake(width, height, gridSize);
  dirCommitted = true;
}


let inputBuffer = [];


function processKey(key) {
  if (!dirCommitted) {
    inputBuffer.push(key);
  }
  if (dirCommitted && key === UP_ARROW && snake.ydir === 0) {
    snake.setDirection(0, -1);
    dirCommitted = false;
  } else if (dirCommitted && key === DOWN_ARROW && snake.ydir === 0) {
    snake.setDirection(0, 1);
    dirCommitted = false;
  } else if (dirCommitted && key === RIGHT_ARROW && snake.xdir === 0) {
    snake.setDirection(1, 0);
    dirCommitted = false;
  } else if (dirCommitted && key === LEFT_ARROW && snake.xdir === 0) {
    snake.setDirection(-1, 0);
    dirCommitted = false;
  } else if (key === 82) {
    newGame();
  }
}

function readBuffer() {
  if (inputBuffer.length > 0) {
    let key = inputBuffer.shift();
    processKey(key);
  }  
}


// function keyPressed() {
//   print(keyCode);
//   //processKey(keyCode);
// }

let savedSnakes = [];

let generations = 1;

let RECORD = 0;
let CURRENT_RECORD = 0;

function drawGame() {
  background(50);
  noStroke();
  //snake.draw();  
  if (sketchBestSnake) {
    sketchBestSnake.draw();
  }
  //snakes.forEach((s) => s.draw());
  textSize(10);
  textAlign(LEFT);
  fill(0, 255, 0);
  text("GENERATION: " + generations, 10, 10);
  text("RECORD: " + RECORD, 10, 25);
  text("CURRENT: " + CURRENT_RECORD, 10, 40);
  text("POPULATION SIZE: " + populationSlider.value(), 10, 55);
  text("VELOCITY: " + velocitySlider.value(), 10, 70);

  
  // if (snake.dead) {
  //   textSize(15);
  //   fill(255,0,0);
  //   textAlign(CENTER);
  //   text('GAME OVER', width/2, height/2);
  //   textSize(15);
  //   text('PRESS "R" TO RESET', width/2, height/2 + 32);
  //   newGame();
  //   return;
  // }
  
  let currentTime = millis();
  let delta = currentTime - lastUpdate;
  let deltaSpeed = (1 / velocitySlider.value()) * 1000;
  if (delta > deltaSpeed) {
    //readBuffer();

    if (sketchBestSnake && !sketchBestSnake.dead) {
      sketchBestSnake.think();
      sketchBestSnake.update();
    }
    //snake.think();
    //snake.update();
    //dirCommitted = true;
    lastUpdate = currentTime;
  }

  if (snakes.length === 0) {
    if (!sketchBestSnake) {
      totalFitness = calcSnakesFitness(savedSnakes);
    } else if (sketchBestSnake && sketchBestSnake.dead) {
      snakes = nextGeneration(savedSnakes, totalFitness);
      savedSnakes = [];
      generations++;
      sketchBestSnake = null;
    }
  } else {

    textSize(15);
    fill(255,0,0);
    textAlign(CENTER);
    text('RUNNING SIMULATION', width/2, height/2);
    snakes.forEach((s) => {
      s.think();
      s.update();
      if (s.dead) {
        savedSnakes.push(s);
      }
    });
    snakes = snakes.filter((s) => !s.dead);
  }
  
}

function setup() {
  createCanvas(gameSize, gameSize);
  //newGame();
  velocitySlider = createSlider(0, 300, 50);
  populationSlider = createSlider(0, 2000, 2000);
  snakes = new Array(populationSlider.value()).fill().map(() => new Snake(width, height, gridSize));
  lastUpdate = millis();
}


function draw() {
  drawGame();
}