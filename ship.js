class Ship {
  constructor(pos, vel, fuel, r, power, timeFactor) {
    this.pos = pos ? pos : vec(0, 0);
    this.vel = vel ? vel : vec(0, 0);
    this.fuel = fuel;
    this.rotate = r;
    this.power = power;
    this.count = 0;
    this.crashed = false;
    this.timeFactor = timeFactor ? timeFactor : 1;
    this.initial = {
      pos,
      vel,
      fuel,
      r,
      power
    };
  }

  reset() {
    this.pos = this.initial.pos;
    this.vel = this.initial.vel;
    this.fuel = this.initial.fuel;
    this.rotate = this.initial.r;
    this.power = this.initial.power;
    this.crashed = false;
    this.count = 0;
  }

  checkLanded() {

  }

  update(tick) {
    if (this.crashed) return;
    if (tick % this.timeFactor === 0) this.count += 1;
    let v = vec(this.vel.x * timeFactor, this.vel.y * timeFactor);
    this.pos = p5.Vector.add(this.pos, v);
    let crash = checkInside(this.pos, surfacePts);
    if (crash) {
      this.crashed = true;
    }
  }

  draw(log) {
    if (log) {
      text(`H Speed: ${round(this.vel.x)}`, 10, 20);
      text(`V Speed: ${round(this.vel.y)}`, 10, 40);
      text(`Position: (${round(this.pos.x)}, ${round(this.pos.y)})`, 10, 60);
      text(`Fuel: ${round(this.fuel)}`, 10, 80);
      text(`Angle: ${round(this.rotate)}`, 10, 100);
      text(`Count: ${this.count}`, 10, 120);
    }
    noFill();
    stroke(255, 255, 255);
    let _x = toP5jsX(this.pos.x);
    let _y = toP5jsY(this.pos.y);
    let _rotate = this.rotate * -1;
    circle(_x, _y, 20);
    stroke(255, 0, 0);
    push();
    translate(_x, _y)
    rotate(radians(_rotate));
    line(0, 0, 0, 0 - 10);
    pop();
  }

  applyForce(force) {
    if (this.crashed) return;
    let f = vec(force.x * this.timeFactor, force.y * this.timeFactor);
    this.vel = p5.Vector.add(this.vel, f);
  }

  applyThrust(t) {
    if (this.crashed) return;
    let r = t[0];
    let p = t[1];
    let delta = Math.min(Math.abs(r - this.rotate), maxRotation);
    let tilt = delta * (r > this.rotate ? 1 : -1);
    this.rotate += tilt;

    let deltaPower = Math.min(Math.abs(p - this.power), 1);
    let dP = deltaPower * (p >= this.power ? 1 : -1);
    this.power += dP * timeFactor;
    
    let a = radians(this.rotate);
    let _x = -this.power * sin(a); // 0 degree on the ship is to up
    let _y = this.power * cos(a);
    this.fuel -= this.power * this.timeFactor;
    let thrust = vec(_x, _y);
    this.applyForce(vec(_x, _y));
  }
}
