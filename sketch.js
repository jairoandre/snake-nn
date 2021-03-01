/** global constants **/
const w = 7000;
const h = 3000;
const scl = 0.1;
const wscl = w * scl;
const hscl = h * scl;
let shipsN = 60;
let thrustsN = 150;


function vec(x, y) {
  return createVector(x, y);
}

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
let timeConst = 1;
let timeFactor = 1/timeConst;
let maxRotation = 15/timeConst;
let maxThrust = 1/timeConst;

function prepareGame() {
  surfaceN = parseInt(readline());
  let n = surfaceN;
  surfacePts = [vec(0, 0)];
  while (n--) {
    surfacePts.push(createVecFromLine(readline()));
  }
  surfacePts.push(vec(w, 0));
}

function drawSurface() {
  fill(255, 0, 0);
  stroke(255, 0, 0);
  beginShape();
  surfacePts.forEach((v) => vertex(toP5jsX(v.x), toP5jsY(v.y)));
  endShape();
}


// PROCESSING STUFF

let ships;
let gravity;
let initialPos;
let tick;
let turn;
let planeSegment;
let thrusts;
let simulation;

function setup() {
  tick = 0;
  turn = 0;
  simulation = 0;
  createCanvas(wscl, hscl);
  prepareGame();
  planeSegment = getPlaneSegment(surfacePts);
  //frameRate(60);
  let initialPos = createVecFromLine("6500 2600");
  let vel = createVecFromLine("-20 0");
  let shipsCount = shipsN;
  ships = [];
  thrusts = [];
  while(shipsCount--) {
    let ship = new Ship(initialPos, vel, 1000, 45, 0, timeFactor);
    ships.push(ship);
    thrusts.push(randomThrusts(thrustsN));
  }
  gravity = vec(0, -3.711);
}

function draw() {
  background(0);
  text(`Turn: ${turn}`, 10, 20);
  text(`Simulation: ${simulation}`, 10, 40);
  drawSurface();
  if (turn >= thrustsN || checkAllDead()) {
    let ga = new GA(ships, thrusts, planeSegment);
    ga.evaluate();
    if (ga.resolved) {
      noLoop();
      console.log(ga.best);
    }
    thrusts = ga.nextPopulation();
    let n = ships.length;
    while (n--) {
      ships[n].reset();
    }
    turn = 1;
    tick = 0;
    simulation += 1;
  }
  for (let i = 0; i < shipsN; i++) {
    let ship = ships[i];
    let shipThrusts = thrusts[i];
    let thrust = shipThrusts[turn];
    ship.applyForce(gravity);
    ship.applyThrust(thrust);
    ship.update(tick);
    ship.draw();
  }
  if (tick % timeConst === 0) {
    turn += 1;
  }
  tick += 1;
}

function checkAllDead() {
  let result = true;
  for (let i = 0; i < ships.length; i++) {
    let s = ships[i];
    if (!s.crashed) {
      result = false;
      break;
    }
  }
  return result;
}