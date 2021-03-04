class Ship {
  constructor(pos, vel, fuel, r, power, timeFactor, gravity) {
    this.pos = {x: pos.x, y: pos.y};
    this.vel = {x: vel.x, y: vel.y};
    this.pVel = { x: vel.x, y: vel.y };
    this.fuel = fuel;
    this.rotate = r;
    this.power = power;
    this.crashed = false;
    this.gravity = gravity ? gravity : { x: 0, y: -3.711 };
    this.timeFactor = timeFactor ? timeFactor : 1;
    this.trajectory = [this.copyVec(this.pos)];
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
    this.pVel = this.copyVec(this.initial.vel);
    this.fuel = this.initial.fuel;
    this.rotate = this.initial.r;
    this.power = this.initial.power;
    this.crashed = false;
    this.trajectory = [this.copyVec(this.pos)];
  }


  fillTrajectory(cmds) {
    this.cmds = [];
    for (let i = 0; i < cmds.length; i++) {
      let cmd = cmds[i];
      this.executeCmd(cmd);
    }
  }

  executeCmd(cmd) {
      if (this.crashed) return;
      //this.applyForce(this.gravity);
      this.applyCmd(cmd);
      this.update();
      this.trajectory.push(this.copyVec(this.pos));
  }

  updateStatus(vertices) {
    this.crashed = checkInside(this.pos, vertices);
  }

  update() {
      this.pos.x += 0.5 * (this.vel.x + this.pVel.x);
      this.pos.y += 0.5 * (this.vel.y + this.pVel.y);
      this.fuel -= this.power;
  }

  applyForce(force) {
    let fx = force.x;
    let fy = force.y;
    let px = this.vel.x;
    let py = this.vel.y;
    this.pVel = { x: px, y: py };
    this.vel.x = px + fx;
    this.vel.y = py + fy;
  }

  applyCmd(cmd) {
    let r = cmd[0];
    let p = cmd[1];

    // Compress the values (to maximum changes per turn)
    let dA = Math.min(Math.abs(this.rotate - r), 15);
    let signedDA = dA * (r > this.rotate ? 1 : -1);
    let dP = Math.min(Math.abs(this.power - p), 1);
    let signedDP = dP * (p >= this.power ? 1 : -1);

    this.rotate += signedDA;
    this.power += signedDP;

    let radiansRotate = this.rotate * Math.PI/180;
    let _x = -this.power * Math.sin(radiansRotate); // 0 degree on the ship is to up
    let _y = this.power * Math.cos(radiansRotate);
    this.applyForce({ x: _x, y: _y - 3.711 });
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
    stroke(0, 255, 0);
    //for (let i = 0; i < this.trajectory.length; i++) {
    //  let pt = this.trajectory[i];
    //  let xt = toP5jsX(pt.x);
    //  let yt = toP5jsY(pt.y);
    //  point(xt, yt);
    //}
  }

}
