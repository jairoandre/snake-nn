/** global constants **/
const WIDTH = 7000;
const HEIGHT = 3000;
const SCALE = 0.2;
const P5_WIDTH = WIDTH * SCALE;
const P5_HEIGHT = HEIGHT * SCALE;

const TOTAL_SHIPS = 80;
const TOTAL_CMDS = 200;

/** global variables **/
let surface;
let turn;
let simulation;
let ships = [];
let cmds = [];
let ga;
let bestFitness = 0;
let bestShip;

function prepareGame() {
  let n = +readline();
  let vertices = [];
  while (n--) {
    vertices.push(createVecFromLine(readline()));
  }
  surface = new Surface(vertices);
}

function setup() {
  turn = 0;  
  simulation = 0;
  createCanvas(P5_WIDTH, P5_HEIGHT);
  prepareGame();
  let shipLine = readline();
  let shipValues = shipLine.split` `.map((v) => parseInt(v));
  let initialPos = vec(shipValues[0], shipValues[1]);
  let vel = vec(shipValues[2], shipValues[3]);
  let fuel = shipValues[4];
  let rotate = shipValues[5];
  let power = shipValues[6];
  let shipsCount = TOTAL_SHIPS;
  while(shipsCount--) {
    let ship = new Ship(initialPos, vel, fuel, rotate, power, surface);
    ship.cmds = ship.randomCmds(TOTAL_CMDS);
    ships.push(ship);
  }
}

function solve() {
  let ga;
  let turn = 0;
  let simulation = 1;
  while (!ga || !ga.resolved) {
    if (turn >= TOTAL_CMDS || checkAllShips()) {
      console.log('Simulation: ' + simulation);
      ga = new GA(ships);
      ga.evaluate();
      if (ga.resolved) {
        return ga.bestShip.cmds;
      }
      let n = ships.length;
      let thrusts = ga.nextPopulation();
      while (n--) {
        ships[n].reset()
        ships[n].cmds = thrusts[n];
      }
      turn = 0;
      simulation++;
    }
    for (let i = 0; i < ships.length; i++) {
      let ship = ships[i];
      let cmds = ship.cmds;
      let cmd = cmds[turn];
      ship.executeCmd(cmd);
    }
    turn++;
  }
}

function draw() {
  background(0);
  text(`Turn: ${turn}`, 10, 20);
  text(`Simulation: ${simulation}`, 10, 40);
  text(`Best Fitness: ${bestFitness}`, 10, 60);
  if(bestShip) text(`Best Ship: (x: ${Math.round(bestShip.pos.x)}, y: ${Math.round(bestShip.pos.y)}) - (r: ${Math.round(bestShip.rotate)}, vx: ${Math.round(bestShip.vel.x)}, vy: ${Math.round(bestShip.vel.y)})`, 10, 80)
  drawSurface(surface);
  if (turn >= TOTAL_CMDS || checkAllShips()) {
    ga = new GA(ships);
    ga.evaluate();
    bestShip = ga.bestShip.clone();
    bestFitness = ga.bestFitness;
    if (ga.resolved) {
      noLoop();
      console.log(ga.bestShip.cmds);
    }
    let thrusts = ga.nextPopulation();
    let n = ships.length;
    while (n--) {
      ships[n].reset();
      ships[n].cmds = thrusts[n];
    }
    turn = 0;
    simulation += 1;
  }
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];
    let cmds = ship.cmds;
    let cmd = cmds[turn];
    ship.executeCmd(cmd);
    drawShip(ship);
  }
  turn += 1;
}

function checkAllShips() {
  for (let i = 0; i < ships.length; i++) {
    let s = ships[i];
    if (s.status == 0) {
      return false;
    }
  }
  return true;
}