/** global constants **/
const WIDTH = 7000;
const HEIGHT = 3000;
const SCALE = 0.2;
const P5_WIDTH = WIDTH * SCALE;
const P5_HEIGHT = HEIGHT * SCALE;

const TOTAL_SHIPS = 60;
const TOTAL_CMDS = 400;

/** global variables **/
let surface;
let turn;
let simulation;
let ships = [];
let cmds = [];
let ga;
let bestFitness = 0;
let bestShip;
let updateShips = true;

function prepareGame() {
  let n = +readline();
  let vertices = [];
  while (n--) {
    vertices.push(createVecFromLine(readline()));
  }
  surface = new Surface(vertices);
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

function toggleShipUpdates() {
  updateShips = !updateShips;
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
  //solve();
}

function solve() {
  let solveTurn = 0;
  let simulations = 1;
  while (true) {
    if (solveTurn >= TOTAL_CMDS || checkAllShips()) {
      let solveGA = new GA(ships);
      solveGA.evaluate();
      if (solveGA.resolved) {
        select('#solution').html(JSON.stringify(solveGA.bestShip.cmds));
        break;
      }
      let newCmds = solveGA.nextPopulation();
      let n = ships.length;
      while (n--) {
        ships[n].reset();
        ships[n].cmds = newCmds[n];
      }
      select('#solution').html(`Simulations: ${simulations++}`);
      solveTurn = 0;
    }
    executeShipCmds(solveTurn);
    select('#solution').html(`Turn: ${solveTurn}`);
    solveTurn += 1;
  }
}


function draw() {
  myDraw();
  //noLoop();
}

function myDraw() {
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
      select('#solution').html(JSON.stringify(ga.bestShip.cmds));
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
  executeShipCmds(turn, true);
  if (updateShips) {
    turn += 1;
  }
}

function executeShipCmds(nTurn, dShip) {
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];
    if (updateShips) {
      let cmds = ship.cmds;
      let cmd = cmds[nTurn];
      ship.executeCmd(cmd);
      if (dShip) drawShip(ship);
    }
  }
}
