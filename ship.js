class Ship {
  constructor(
    pos,
    vel,
    fuel,
    r,
    power,
    planeSegment,
    surfacePts,
    surfaceLengths,
    totalSurfaceLength
  ) {
    this.pos = pos.clone();
    this.vel = vel.clone();
    this.pVel = vel.clone();
    this.fuel = fuel;
    this.rotate = r;
    this.power = power;
    this.planeSegment = planeSegment;
    this.surfacePts = surfacePts;
    this.surfaceLengths = surfaceLengths;
    this.totalSurfaceLength = totalSurfaceLength;
    this.gravity = new Point(0, -3.711);
    this.status = 0; // 0 - flying; 1 - landed; -1 - crashed
    this.cmds = [];
    this.history = [];
    this.initial = {
      pos,
      vel,
      fuel,
      r,
      power,
    };
  }

  randomCmds(n) {
    let prev = [this.rotate, this.power];
    let result = [];
    for (let i = 0; i < n; i++) {
      let curr = randomCmd(prev);
      result.push(curr);
      prev = curr;
    }
    return result;
  }

  clone() {
    let clone = new Ship(
      this.pos,
      this.vel,
      this.fuel,
      this.rotate,
      this.power,
      this.planeSegment,
      this.surfacePts,
      this.surfaceLengths,
      this.totalSurfaceLength
    );
    clone.status = this.status;
    clone.cmds = cmds.map((v) => {
      return v;
    });
    return clone;
  }

  calcFitness() {
    let len = this.surfacePts.length;
    if (this.status === 1) {
      return 10000;
    }
    let prev = this.history[this.history.length - 1];
    let fitness = 1 / (1 + this.heuristicDistance());
    if (doIntersect(this.planeSegment[0], this.planeSegment[1], prev, this.pos)) {
      let vx = Math.abs(this.vel.x);
      let vy = Math.abs(this.vel.y);
      let rotate = Math.abs(this.rotate);
      fitness += vx > 20 ? 1 / vx * 10 : 1;
      fitness += vy > 40 ? 1 / vy * 20 : 1;
      fitness += (10 * (90 - rotate)) / 90;
    }
    return fitness;
  }

  reset() {
    this.pos = this.initial.pos.clone();
    this.vel = this.initial.vel.clone();
    this.pVel = this.initial.vel.clone();
    this.fuel = this.initial.fuel;
    this.rotate = this.initial.r;
    this.power = this.initial.power;
    this.status = 0;
    this.history = [];
    this.cmds = [];
  }

  executeCmds() {
    for (let i = 0; i < cmds.length; i++) {
      let cmd = cmds[i];
      if (this.status != 0) break;
      this.executeCmd(cmd);
    }
  }

  executeCmd(cmd) {
    if (this.status != 0) return;
    // Put the current position on the history array;
    this.history.push(this.pos.clone());
    this.applyCmd(cmd);
    this.update(cmd);
  }

  update(cmd) {
    this.pos.x += 0.5 * (this.vel.x + this.pVel.x);
    this.pos.y += 0.5 * (this.vel.y + this.pVel.y);
    this.fuel -= this.power;
    let prev = this.history[this.history.length - 1];
    if (
      doIntersect(
        this.planeSegment[0],
        this.planeSegment[1],
        prev,
        this.pos
      )
    ) {
      if (Math.abs(this.rotate) <= 15) {
        cmd[0] = 0; // force the rotate command to zero
        cmd[1] = 4;
        this.rotate = 0;
        if (Math.abs(this.vel.x) <= 20 && Math.abs(this.vel.y) <= 40) {
          this.status = 1; // landed
          return;
        }
      }
    }
    this.status = hitTheGround(prev, this.pos, surfacePts) ? -1 : 0;
  }

  applyForce(force) {
    let fx = force.x;
    let fy = force.y;
    let px = this.vel.x;
    let py = this.vel.y;
    this.pVel = vec(px, py);
    this.vel.x = px + fx;
    this.vel.y = py + fy;
  }

  /**
   * Given a two dimensional array [angle, power], change the velocity vector.
   *
   * @param {Array} cmd
   */
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

    let radiansRotate = (this.rotate * Math.PI) / 180;
    let _x = -this.power * Math.sin(radiansRotate); // 0 degree on the ship is to up
    let _y = this.power * Math.cos(radiansRotate);
    this.applyForce({ x: _x, y: _y - 3.711 });
  }

  heuristicDistance() {
    let len = this.surfacePts.length;
    let p1 = this.history[this.history.length - 1];
    let q1 = this.pos;
    let idx;
    let lDist;
    let rDist;
    for (let i = 1; i < len - 2; i++) {
      let p2 = this.surfacePts[i];
      let q2 = this.surfacePts[i + 1];
      if (doIntersect(p1, q1, p2, q2)) {
        if (p2.y === q2.y) {
          return 0;
        }
        idx = i;
        lDist = p1.x - p2.x;
        rDist = q2.x - p1.x;
        break;
      }
    }
    let pIdx;
    for (let i = 1; i < len - 2; i++) {
      let p2 = this.surfacePts[i];
      let q2 = this.surfacePts[i + 1];
      if (p2.y === q2.y) {
        pIdx = i;
        break;
      }
    }

    let bIdx, eIdx;

    let sum = 0;
    if (idx > pIdx) {
      bIdx = pIdx;
      eIdx = idx;
      sum = lDist;
    } else {
      bIdx = idx;
      eIdx = pIdx;
      sum = rDist;
    }

    for (let i = bIdx + 1; i < eIdx - 1; i++) {
      sum += this.surfaceLengths[i];
    }

    return sum ? sum : Infinity;
  }

  draw(log) {
    if (log) {
      text(`H Speed: ${Math.floor(this.vel.x)}`, 10, 20);
      text(`V Speed: ${Math.floor(this.vel.y)}`, 10, 40);
      text(
        `Position: (${Math.floor(this.pos.x)}, ${Math.floor(this.pos.y)})`,
        10,
        60
      );
      text(`Fuel: ${Math.floor(this.fuel)}`, 10, 80);
      text(`Angle: ${Math.floor(this.rotate)}`, 10, 100);
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
    beginShape();
    this.history.forEach((v) => vertex(toP5jsX(v.x), toP5jsY(v.y)));
    vertex(toP5jsX(this.pos.x), toP5jsY(this.pos.y));
    endShape();
  }
}
