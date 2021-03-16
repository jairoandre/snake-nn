function toP5jsX(codingameX) {
  return codingameX * SCALE;
}

function toP5jsY(codingameY) {
  return P5_HEIGHT - codingameY * SCALE;
}

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
  yield "6500 2600 -20 0 1000 45 0";
}

function* test2() {
  yield "18";
  yield "0 1800";
  yield "300 1200";
  yield "1000 1550";
  yield "2000 1200";
  yield "2500 1650";
  yield "3700 220";
  yield "4700 220";
  yield "4750 1000";
  yield "4700 1650";
  yield "4000 1700";
  yield "3700 1600";
  yield "3750 1900";
  yield "4000 2100";
  yield "4900 2050";
  yield "5100 1000";
  yield "5500 500";
  yield "6200 800";
  yield "6999 600";
  yield "6500 2000 0 0 1200 0 0";
}

const testGen = test2();

function readline() {
  const r = testGen.next();
  if (r.done) return "";
  else return r.value;
}

const OFFSET_INFO = 400;

function drawShip(ship) {
    //let d = dist(toP5jsX(ship.pos.x), toP5jsY(ship.pos.y), mouseX, mouseY);
    //if (d < 10) {
    if (false) {
      text(`H Speed: ${Math.floor(ship.vel.x)}`, OFFSET_INFO, 20);
      text(`V Speed: ${Math.floor(ship.vel.y)}`, OFFSET_INFO, 40);
      text(
        `Position: (${Math.floor(ship.pos.x)}, ${Math.floor(ship.pos.y)})`,
        OFFSET_INFO,
        60
      );
      text(`Fuel: ${Math.floor(ship.fuel)}`, OFFSET_INFO, 80);
      text(`Angle: ${Math.floor(ship.rotate)}`, OFFSET_INFO, 100);
      text(`Fitness: ${ship.fitness()}`, OFFSET_INFO, 120);
    }
    noFill();
    stroke(255, 255, 255);
    let _x = toP5jsX(ship.pos.x);
    let _y = toP5jsY(ship.pos.y);
    let _rotate = ship.rotate * -1;
    let c = circle(_x, _y, 20);
    stroke(255, 0, 0);
    push();
    translate(_x, _y);
    rotate(radians(_rotate));
    line(0, 0, 0, 0 - 10);
    pop();
    stroke(0, 255, 0);
    beginShape();
    ship.history.forEach((v) => vertex(toP5jsX(v.x), toP5jsY(v.y)));
    vertex(toP5jsX(ship.pos.x), toP5jsY(ship.pos.y));
    endShape();
  }

  function drawSurface(surface) {
    noFill();
    stroke(255, 0, 0);
    beginShape();
    vertex(0, HEIGHT);
    surface.vertices.forEach((v) => vertex(toP5jsX(v.x), toP5jsY(v.y)));
    vertex(WIDTH, HEIGHT);
    endShape();
  }