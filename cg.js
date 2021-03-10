class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  clone() {
    return new Point(this.x, this.y);
  }
  dist(point) {
    let a = this.x - point.x;
    let b = this.y - point.y;
    return Math.sqrt(a * a + b * b);
  }
}

function vec(x, y) {
  return new Point(x, y);
}

function createVecFromLine(line) {
  const xy = line.split` `.map((v) => +v);
  return vec(xy[0], xy[1]);
}

function onSegment(p, q, r) {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

function _orientation(p, q, r) {
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val == 0) return 0;
  return val > 0 ? 1 : 2;
}

function doIntersect(p1, q1, p2, q2) {
  let o1 = _orientation(p1, q1, p2);
  let o2 = _orientation(p1, q1, q2);
  let o3 = _orientation(p2, q2, p1);
  let o4 = _orientation(p2, q2, q1);

  if (o1 != o2 && o3 != o4) return true;

  if (o1 == 0 && onSegment(p1, p2, q1)) return true;

  if (o2 == 0 && onSegment(p1, q2, q1)) return true;

  if (o3 == 0 && onSegment(p2, p1, q2)) return true;

  if (o4 == 0 && onSegment(p2, q1, q2)) return true;

  return false;
}

function randIn(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function compress(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function randomCmd(prev) {
  if (prev) {
    let a = randIn(-15, 15);
    let p = randIn(-1, 1);
    a += prev[0];
    p += prev[1];
    return [compress(a, -90, 90), compress(p, 0, 4)];
  } else {
    let a = randIn(-90, 90);
    let p = randIn(0, 4);
    return [a, p];
  }
}

/**
 * Surface class
 */
class Surface {
  constructor(vertices) {
    this.vertices = vertices;
    this.segments = [];
    for (let i = 0; i < vertices.length - 1; i++) {
      let lPt = vertices[i];
      let rPt = vertices[i + 1];
      this.segments.push([lPt, rPt]);
      if (lPt.y === rPt.y) {
        this.planeIdx = i;
      }
    }
    this.totalLength = 0;
    this.segmentsLengths = [];
    for (let i = 0; i < this.segments.length; i++) {
      let s = this.segments[i];
      let d = s[0].dist(s[1]);
      this.segmentsLengths.push(d);
      this.totalLength += d;
    }
  }
  hitTheGround(prev, curr) {
    for (let i = 0; i < this.segments.length; i++) {
      let ground = this.segments[i];
      if (doIntersect(prev, curr, ground[0], ground[1])) {
        return i;
      }
    }
    return -1;
  }
}

/**
 * SHIP CLASS
 */

class Ship {
  constructor(pos, vel, fuel, rotate, power, surface) {
    this.pos = pos.clone();
    this.vel = vel.clone();
    this.pVel = vel.clone();
    this.fuel = fuel;
    this.rotate = rotate;
    this.power = power;
    this.surface = surface;
    this.status = 0; // 0 - flying; 1 - landed; -1 - crashed
    this.cmds = [];
    this.history = [];
    this.rotates = [];
    this.landed = false;
    this.initial = {
      pos,
      vel,
      fuel,
      rotate,
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
      this.surface
    );
    clone.status = this.status;
    clone.cmds = cmds.map((v) => {
      return [v[0], v[1]];
    });
    return clone;
  }

  fitness() {
    if (
      this.status == 0 ||
      this.pos.x < 0 ||
      this.pos.y > WIDTH ||
      this.pos.y < 0 ||
      this.pos.y > HEIGHT
    ) {
      return 1;
    }
    if (this.landed) return 1000;
    let vx = this.vel.x;
    let absVx = Math.abs(vx);
    let vy = this.vel.y;
    let absVy = Math.abs(vy);
    let speed = Math.sqrt(vx * vx + vy * vy);
    let absRotate = Math.abs(this.rotate);
    let fitness = 0;
    if (this.status == -1) {
      // hit the ground, but not the plane segment
      let he = this.heuristicDistance();
      fitness = 100 - (100 * he) / this.surface.totalLength;
      let speedMod = 0.1 * Math.max(speed - 100, 0);
      fitness -= speedMod;
    } else if (absVx > 20 || vy < -40) {
      let xMod = 0;
      if (absVx > 20) {
        xMod = (absVx - 20) / 2;
      }
      let yMod = 0;
      if (vy < -40) {
        yMod = (absVy - 40) / 2;
      }
      let rMod = 0;
      if (absRotate > 15) {
        rMod = (absRotate - 15) / 2;
      }
      fitness = 200 - xMod - yMod - rMod;
    } else {
      fitness = 200 + (100 * this.fuel) / this.initial.fuel;
    }
    return fitness;
  }

  reset() {
    this.pos = this.initial.pos.clone();
    this.vel = this.initial.vel.clone();
    this.pVel = this.initial.vel.clone();
    this.fuel = this.initial.fuel;
    this.rotate = this.initial.rotate;
    this.power = this.initial.power;
    this.status = 0;
    this.history = [];
    this.rotates = [];
    this.cmds = [];
    this.landed = false;
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
    this.rotates.push(this.rotate);
    this.history.push(this.pos.clone());
    this.applyCmd(cmd);
    this.update(cmd);
  }

  update(cmd) {
    this.pos.x += 0.5 * (this.vel.x + this.pVel.x);
    this.pos.y += 0.5 * (this.vel.y + this.pVel.y);
    this.fuel -= this.power;
    let prev = this.history[this.history.length - 1];
    let hitIdx = this.surface.hitTheGround(prev, this.pos);
    this.status = hitIdx >= 0 ? (hitIdx == this.surface.planeIdx ? 1 : -1) : 0;
    if (this.status == 1) {
      // hit the land zone
      let prevRotate = Math.abs(this.rotates[this.rotates.length - 1]);
      if (prevRotate <= 15) {
        cmd[0] = 0; // force the rotate command to zero
        if (Math.abs(this.vel.x) <= 20 && this.vel.y >= -40) {
          this.landed = true;
        }
      }
    }
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
    let prev = this.history[this.history.length - 1];
    let curr = this.pos;
    let hitIdx = this.surface.hitTheGround(prev, curr);
    if (hitIdx < 0) return this.surface.totalSurfaceLength;
    let planeIdx = this.surface.planeIdx;
    if (hitIdx == planeIdx) return 0;
    if (hitIdx > this.surface.planeIdx) {
      let dist = this.surface.segments[hitIdx][0].dist(curr);
      for (let i = planeIdx + 1; i < hitIdx; i++) {
        dist += this.surface.segmentsLengths[i];
      }
      return dist;
    } else {
      let dist = this.surface.segments[hitIdx][1].dist(curr);
      for (let i = hitIdx + 1; i < planeIdx; i++) {
        dist += this.surface.segmentsLengths[i];
      }
      return dist;
    }
  }
}

/**
 * GENETIC ALGORITHM STUFF
 */

class GA {
  constructor(ships) {
    this.ships = ships;
    this.fitness = [];
    this.muttation = 0.01;
    this.elitsm = 0.1;
    this.resolved = false;
    this.best = [];
    this.bestShip;
    this.bestFitness = -1;
  }

  evaluate() {
    let shipLen = this.ships.length;
    let sum = 0;

    for (let i = 0; i < shipLen; i++) {
      let ship = this.ships[i];
      if (ship.landed) {
        this.bestShip = this.ships[i];
        this.resolved = true;
        return;
      }
      let fitness = ship.fitness();
      if (fitness > this.bestFitness) {
        this.bestFitness = fitness;
        this.bestShip = this.ships[i];
      }
      sum += fitness;
      this.fitness.push({ idx: i, fitness: fitness });
    }

    // normalize fitness
    this.fitness.forEach((f) => {
      f.fitness = f.fitness / sum;
      f._fitness = 0;
    });
    // desc ordernation
    this.fitness.sort((a, b) => b.fitness - a.fitness);
    // set accumulation
    for (let cIdx = 0; cIdx < shipLen - 1; cIdx++) {
      let c = this.fitness[cIdx];
      let _fitness =
        c.fitness +
        this.fitness.slice(cIdx + 1).reduce((acc, v) => {
          let f = acc.fitness + v.fitness;
          return { fitness: f };
        }).fitness;
      c._fitness = _fitness;
    }
  }

  select() {
    let r = Math.random(); // random between 0 and 1;
    let n = this.fitness.length;
    while (n--) {
      let f = this.fitness[n];
      if (f._fitness >= r) {
        let idx = f.idx;
        return this.ships[idx].cmds;
      }
    }
    return this.ships[0].cmds;
  }

  mutate(cmds, idx) {
    let mr = Math.random();
    if (this.muttation >= mr) {
      let prev = idx > 0 ? cmds[idx - 1] : undefined;
      cmds[idx] = randomCmd(prev);
    }
  }

  crossover(t1, t2) {
    let c1 = [];
    let c2 = [];
    for (let n = 0; n < t1.length; n++) {
      let g1 = t1[n];
      let g2 = t2[n];
      let rga = Math.random();
      // Continuous Genetic Algorithm
      let ac1 = Math.round(rga * g1[0] + (1 - rga) * g2[0]);
      let rc1 = Math.round(rga * g1[1] + (1 - rga) * g2[1]);
      let ac2 = Math.round(rga * g2[0] + (1 - rga) * g1[0]);
      let rc2 = Math.round(rga * g2[1] + (1 - rga) * g1[1]);
      c1.push([ac1, rc1]);
      c2.push([ac2, rc2]);
    }
    for (let idx = 0; idx < c1.length; idx++) {
      this.mutate(c1, idx);
      this.mutate(c2, idx);
    }
    return [c1, c2];
  }

  nextPopulation() {
    let newThrusts = [];
    let s = Math.round(this.ships.length * this.elitsm);
    for (let i = 0; i < s; i++) {
      let f = this.fitness[i];
      newThrusts.push(this.ships[f.idx].cmds);
    }
    let n = Math.round((this.ships.length - s) / 2);
    while (n--) {
      let p1 = this.select();
      let p2 = this.select();
      let cs = this.crossover(p1, p2);
      let t1 = cs[0];
      let t2 = cs[1];
      newThrusts.push(cs[0]);
      newThrusts.push(cs[1]);
    }
    return newThrusts;
  }
}
