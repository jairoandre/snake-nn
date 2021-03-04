/** global constants **/
const w = 7000;
const h = 3000;


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
let shipsN = 40;
let thrustsN = 200;
let timeConst = 1;
let timeFactor = 1/timeConst;
let ships;
let gravity;
let initialPos;
let tick;
let turn;
let planeSegment;
let thrusts;
let simulation;
let scl = 0.2;
let wscl = w * scl;
let hscl = h * scl;
let slider;

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

function updateTurn() {
  if (tick % timeConst === 0) {
    turn += 1;
  }
}

let cmds = [];

function setup1() {
  tick = 0;
  turn = 0;  
  simulation = 0;
  createCanvas(wscl, hscl);
  ships = [new Ship(vec(5000, 2500), vec(-50, 0), 1000, 90, 0)];
  cmds = randomThrusts(200);
}

function draw1() {
  background(0);
  if (tick % timeConst === 0 && turn < cmds.length) {
    ships[0].executeCmd(cmds[turn]);
    ships[0].turn = turn;
  }
  ships[0].draw(true);
  tick += 1;
  updateTurn();
}


function setup() {
  tick = 0;
  turn = 0;  
  simulation = 0;
  createCanvas(wscl, hscl);
  prepareGame();
  planeSegment = getPlaneSegment(surfacePts);
  //frameRate(60);
  let shipLine = readline();
  let shipValues = shipLine.split` `.map((v) => parseInt(v));
  let initialPos = vec(shipValues[0], shipValues[1]);
  let vel = vec(shipValues[2], shipValues[3]);
  let fuel = shipValues[4];
  let rotate = shipValues[5];
  let power = shipValues[6];
  let shipsCount = shipsN;
  ships = [];
  thrusts = [];
  while(shipsCount--) {
    let ship = new Ship(initialPos, vel, fuel, rotate, power, timeFactor);
    ship.timeConst = timeConst;
    ships.push(ship);
    thrusts.push(randomThrusts(thrustsN));
  }
  gravity = vec(0, -3.711);
}

function draw() {
  myDraw();
}

function myDraw() {
  background(0);
  text(`Turn: ${turn}`, 10, 20);
  text(`Simulation: ${simulation}`, 10, 40);
  drawSurface();
  if (turn >= thrustsN || checkAllDead()) {
    let ga = new GA(ships, thrusts, planeSegment);
    ga.evaluate();
    //console.log(JSON.stringify(ga.best));
    let bestShip = ga.bestShip;
    //console.log(`${bestShip.pos.x}, ${bestShip.pos.y}, ${bestShip.rotate}`);
    //console.log(JSON.stringify(bestShip.trajectory.map((t)=> { return { x: Math.round(t.x), y: Math.round(t.y) }; })));
    if (ga.resolved) {
      noLoop();
      console.log(ga);
    }
    thrusts = ga.nextPopulation();
    let n = ships.length;
    while (n--) {
      ships[n].reset();
    }
    tick = 0;
    turn = 0;
    simulation += 1;
  }
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];
    let shipCmds = thrusts[i];
    let cmd = shipCmds[turn];
    ship.executeCmd(cmd);
    ship.updateStatus(surfacePts);
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