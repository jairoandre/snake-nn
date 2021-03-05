class GA {
  constructor(ships, thrusts, planeSegment) {
    this.ships = ships;
    this.thrusts = thrusts;
    this.planeSegment = planeSegment;
    this.fitness = [];
    this.muttation = 0.2;
    this.elitsm = 0.3;
    this.resolved = false;
    this.best = [];
    this.bestShip;
  }

  evaluate() {
    let shipLen = this.ships.length;
    let sum = 0;

    let bestFitness = -Infinity;

    for (let i = 0; i < shipLen; i++) {
      let ship = this.ships[i];
      let fitness = ship.calcFitness(planeSegment);
      if (fitness > bestFitness) {
        bestFitness = fitness;
        this.best = this.thrusts[i];
        this.bestShip = this.ships[i];
        this.resolved = ship.landed;
      }
      sum += fitness;
      this.fitness.push({ idx: i, fitness: fitness });
    }

    // normalize fitness
    this.fitness.forEach((f) => {
      f.fitness = f.fitness / sum;
    });
    // desc ordernation
    this.fitness.sort((a, b) => b.fitness - a.fitness);
    // set accumulation
    for (let cIdx = 0; cIdx < shipLen; cIdx++) {
      let c = this.fitness[cIdx];
      let _fitness =
        c.fitness +
        this.fitness.slice(cIdx).reduce((acc, v) => {
          let f = acc.fitness + v.fitness;
          return { fitness: f };
        }).fitness;
      c._fitness = _fitness;
    }
    //console.log(this.best);
  }

  select() {
    let r = random(); // random between 0 and 1;
    let n = this.fitness.length;
    while (n--) {
      let f = this.fitness[n];
      if (f._fitness >= r) {
        let idx = f.idx;
        return this.thrusts[idx];
      }
    }
    return this.thrusts[0];
  }

  crossover(t1, t2) {
    let c1 = [];
    let c2 = [];
    let n = t1.length;
    while (n--) {
      let g1 = t1[n];
      let g2 = t2[n];
      let rga = random();
      let ac1 = rga * g1[0] + (1 - rga) * g2[0];
      let rc1 = rga * g1[1] + (1 - rga) * g2[1];
      let ac2 = rga * g2[0] + (1 - rga) * g1[0];
      let rc2 = rga * g2[1] + (1 - rga) * g1[1];
      c1.push([round(ac1), round(rc1)]);
      c2.push([round(ac2), round(rc2)]);
    }
    c1.reverse();
    c2.reverse();
    for (let i = 0; i < c1.length; i++) {
      let mr = random();
      if (this.muttation >= mr) {
        let rIdx = round(random(t1.length - 1));
        c1[rIdx] = randomThrust(rIdx > 0 ? c1[rIdx - 1][0] : undefined);
      }
      mr = random();
      if (this.muttation >= mr) {
        let rIdx = round(random(t1.length - 1));
        c2[rIdx] = randomThrust(rIdx > 0 ? c2[rIdx - 1][0] : undefined);
      }
    }
    return [c1, c2];
  }

  nextPopulation() {
    let newThrusts = [];

    let s = round(this.thrusts.length * this.elitsm);
    for (let i = 0; i < s; i++) {
      let f = this.fitness[i];
      newThrusts.push(this.thrusts[f.idx]);
    }
    let n = round((this.thrusts.length - s) / 2);
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
