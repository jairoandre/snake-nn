/** global constants **/
const w = 7000;
const h = 3000;
const scl = 0.2;
const wscl = w * scl;
const hscl = h * scl;

function* test1() {
  yield "22";
  yield "0 450";
  yield "300 750";
  yield "1000 450";
  yield "1500 650";
  yield "1800 850";
  yield "2000 1950";
  yield "2200 1850";
  yield "2400 2000";
  yield "3100 1800";
  yield "3150 1550";
  yield "2500 1600";
  yield "2200 1550";
  yield "2100 750";
  yield "2200 150";
  yield "3200 150";
  yield "3500 450";
  yield "4000 950";
  yield "4500 1450";
  yield "5000 1550";
  yield "5500 1500";
  yield "6000 950";
  yield "6999 1750";
  yield "6500 2600 -20  0 1000 45 0";
}

const test1Gen = test1();

function readline() {
  const r = test1Gen.next();
  if (r.done) return gameState();
  else return r.value;
}

function gameState() {
  return "end";
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  toVector() {
    return vec(toP5jsX(this.x), toP5jsY(this.y));
  }
}

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

function createPtFromLine(line) {
  const xy = line.split` `.map((v) => parseInt(v));
  return new Point(xy[0], xy[1]);
}

function createVecFromLine(line) {
  const xy = line.split` `.map((v) => parseInt(v));
  return vec(xy[0], xy[1]);
}

/** global variables **/
let surfaceN;
let surfacePts;

function prepareGame() {
  surfaceN = parseInt(readline());
  let n = surfaceN;
  surfacePts = [vec(0, 0)];
  while (n--) {
    surfacePts.push(createVecFromLine(readline()));
  }
  surfacePts.push(vec(w, 0));
  //surfacePts = new Array(surfaceN).fill().map(() => createPtFromLine(readline()).toVector());
}

class Ship {
  constructor(pos, vel) {
    this.pos = pos ? pos : vec(0, 0);
    this.vel = vel ? vel : vec(random(10), random(10));
    this.count = 0;
    this.tick = 0;
  }

  update() {
    this.tick += 1;
    let v = vec(this.vel.x * 1/60, this.vel.y * 1/60);
    this.pos = p5.Vector.add(this.pos, this.vel);
    if (this.pos.x > w || this.pos.x < 0 || this.pos.y > h || this.pos.y < 0) {
      this.pos = createVecFromLine("6500 2600");
      this.vel = vec(random(1, -10), random(5));
      this.count = 0;
    }

    if (this.tick % 60 === 0) {
      this.count += 1;
    }
  }

  draw() {
    text(`Horizontal velocity: ${this.vel.x}`, 10, 20);
    text(`Vertical velocity: ${round(this.vel.y)}`, 10, 40);
    text(`Position: (${round(this.pos.x)}, ${round(this.pos.y)})`, 10, 60);
    text(`Count: ${this.count}`, 10, 80);
    stroke(255, 255, 255);
    circle(toP5jsX(this.pos.x), toP5jsY(this.pos.y), 10);
  }

  applyForce(force) {
    let f = vec(force.x * 1/60, force.y * 1/60)
    this.vel = p5.Vector.add(this.vel, f);
  }
}

let ship;
let gravity;
let initialPos;

function drawSurface() {
  noFill();
  stroke(255, 0, 0);
  beginShape();
  surfacePts.forEach((v) => vertex(toP5jsX(v.x), toP5jsY(v.y)));
  endShape();
}

function setup() {
  createCanvas(wscl, hscl);
  prepareGame();
  frameRate(60);
  let initialPos = createVecFromLine("6000 2000");
  ship = new Ship(initialPos);
  gravity = vec(0, -3.711);
}

function draw() {
  background(0);
  drawSurface();
  ship.applyForce(gravity);
  ship.update();
  ship.draw();
}
