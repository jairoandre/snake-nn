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
      if (ship.status === 1) {
        this.bestShip = this.ships[i];
        this.resolved = true;
        return;
      }
      let fitness = ship.calcFitness();
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
    for(let n = 0; n < t1.length; n++) {
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
