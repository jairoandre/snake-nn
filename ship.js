class Ship {
  constructor(pos, vel, fuel, r, power, timeFactor) {
    this.pos = {x: pos.x, y: pos.y};
    this.vel = {x: vel.x, y: vel.y};
    this.fuel = fuel;
    this.rotate = r;
    this._rotate = r;
    this.power = power;
    this._power = power;
    this.turn = 0;
    this.crashed = false;
    this.timeFactor = timeFactor ? timeFactor : 1;
    this.timeConst = 60;
    this.initial = {
      pos,
      vel,
      fuel,
      r,
      power,
    };
  }
  
  copyVec(v) {
    return { x: v.x, y: v.y };
  }

  reset() {
    this.pos = this.copyVec(this.initial.pos);
    this.vel = this.copyVec(this.initial.vel);
    this.fuel = this.initial.fuel;
    this.rotate = this.initial.r;
    this.power = this.initial.power;
    this._rotate = this.rotate;
    this._power = this.power;
    this.crashed = false;
    this.turn = 0;
  }

  checkLanded() {}

  update(tick, cmd) {
    if (this.crashed) return;
    if (tick % this.timeConst === 0) {
      this.turn += 1;
      this.rotate = Math.round(this.rotate);
      this.power = Math.round(this.power);
      this._rotate = this.rotate;
      this._power = this.power;
      this.fuel -= this.power;
      this.pos.x = Math.round(this.pos.x);
      this.pos.y = Math.round(this.pos.y);
      this.vel.x = Math.round(this.vel.x);
      this.vel.y = Math.round(this.vel.y);
    }
    this.applyCmd(cmd);
    let vx = this.vel.x * timeFactor;
    let vy = this.vel.y * timeFactor;
    this.pos.x += vx;
    this.pos.y += vy;
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
      text(`Turn: ${this.turn}`, 10, 120);
    }
    noFill();
    stroke(255, 255, 255);
    let _x = toP5jsX(this.pos.x);
    let _y = toP5jsY(this.pos.y);
    let _rotate = this.rotate * -1;
    circle(_x, _y, 20);
    stroke(255, 0, 0);
    push();
    translate(_x, _y);
    rotate(radians(_rotate));
    line(0, 0, 0, 0 - 10);
    pop();
  }

  applyForce(force) {
    if (this.crashed) return;
    let fx = force.x * this.timeFactor;
    let fy = force.y * this.timeFactor;
    this.vel.x += fx;
    this.vel.y += fy;
  }

  applyCmd(cmd) {
    let r = cmd[0];
    let p = cmd[1];
    let dA = Math.min(Math.abs(r - this._rotate), 15);
    let signedDA = dA * (r > this._rotate ? 1 : -1);
    let dP = Math.min(Math.abs(p - this._power), 1);
    let signedDP = dP * (p >= this._power ? 1 : -1);
    let tickCmd = [signedDA, signedDP];
    this.rotate += tickCmd[0] * this.timeFactor;
    this.power += tickCmd[1] * this.timeFactor;
    let realRotate = ((this._rotate + tickCmd[0]) * Math.PI) / 180;
    let realForce = this._power + tickCmd[1];
    let _x = -realForce * Math.sin(realRotate); // 0 degree on the ship is to up
    let _y = realForce * Math.cos(realRotate);
    this.applyForce({ x: _x, y: _y });
  }
}
