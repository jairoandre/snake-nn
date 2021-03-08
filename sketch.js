/** global constants **/
const w = 7000;
const h = 3000;


function toP5jsX(codingameX) {
  return codingameX * scl;
}

function toP5jsY(codingameY) {
  let yscl = hscl - codingameY * scl;
  return yscl;
}

function createVecFromLine(line) {
  const xy = line.split` `.map((v) => parseInt(v));
  return vec(xy[0], xy[1]);
}

/** global variables **/
let surfaceN;
let surfacePts;
let surfaceLengths;
let shipsN = 60;
let thrustsN = 200;
let timeConst = 1;
let timeFactor = 1/timeConst;
let ships;
let tick;
let turn;
let planeSegment;
let simulation;
let scl = 0.2;
let wscl = w * scl;
let hscl = h * scl;
let slider;
let ga;
let totalSurfacePerimeter;

function prepareGame() {
  surfaceN = parseInt(readline());
  let n = surfaceN;
  surfacePts = [vec(0, 0)];
  while (n--) {
    surfacePts.push(createVecFromLine(readline()));
  }
  surfacePts.push(vec(w, 0));
  surfaceLengths = calcSurfaceLength(surfacePts);
  totalSurfacePerimeter = surfaceLengths.reduce((a, b) => { return a + b; });
  console.log(`TOTAL SURFACE PERIMETER: ${totalSurfacePerimeter}`);

}

function drawSurface() {
  fill(255, 0, 0);
  stroke(255, 0, 0);
  beginShape();
  surfacePts.forEach((v) => vertex(toP5jsX(v.x), toP5jsY(v.y)));
  endShape();
}

function updateTurn() {
  if (tick % timeConst === 0) {
    turn += 1;
  }
}

let cmds = [];

function setup() {
  tick = 0;
  turn = 0;  
  simulation = 0;
  createCanvas(wscl, hscl);
  prepareGame();
  planeSegment = getPlaneSegment(surfacePts);
  let shipLine = readline();
  let shipValues = shipLine.split` `.map((v) => parseInt(v));
  let initialPos = vec(shipValues[0], shipValues[1]);
  let vel = vec(shipValues[2], shipValues[3]);
  let fuel = shipValues[4];
  let rotate = shipValues[5];
  let power = shipValues[6];
  let shipsCount = shipsN;
  ships = [];
  while(shipsCount--) {
    let ship = new Ship(initialPos, vel, fuel, rotate, power, planeSegment, surfacePts, surfaceLengths, totalSurfacePerimeter);
    ship.cmds = ship.randomCmds(thrustsN);
    ships.push(ship);
  }
}

function draw() {
  //noLoop();
  myDraw();
}

let bestFitness = 0;
let bestShip;

function myDraw() {
  background(0);
  text(`Turn: ${turn}`, 10, 20);
  //console.log(`Turn: ${turn}`, 10, 20);
  text(`Simulation: ${simulation}`, 10, 40);
  text(`Best Fitness: ${bestFitness}`, 10, 60);
  if(bestShip) text(`Best Ship: (x: ${Math.round(bestShip.pos.x)}, y: ${Math.round(bestShip.pos.y)}) - (r: ${Math.round(bestShip.rotate)}, vx: ${Math.round(bestShip.vel.x)}, vy: ${Math.round(bestShip.vel.y)})`, 10, 80)
  //console.log(`Simulation: ${simulation}`, 10, 40);
  drawSurface();
  if (turn >= thrustsN || checkAllShips()) {
    ga = new GA(ships);
    ga.evaluate();
    bestShip = ga.bestShip.clone();
    bestFitness = ga.bestFitness;
    //console.log(`pos: (${Math.round(bestShip.pos.x)}, ${Math.round(bestShip.pos.y)}); rotate: ${bestShip.rotate}; vel: (${Math.round(bestShip.vel.x)}, ${Math.round(bestShip.vel.y)})`);
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
    tick = 0;
    turn = 0;
    simulation += 1;
  }
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];
    let cmds = ship.cmds;
    let cmd = cmds[turn];
    ship.executeCmd(cmd);
    ship.draw();
  }
  if (tick % timeConst === 0) {
    turn += 1;
  }
  tick += 1;
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