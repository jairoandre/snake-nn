class Snake {
  constructor(w, h, s, brain) {
    this.w = w;
    this.h = h;
    this.s = s;
    this.x = this.randomX();
    this.y = this.randomY();
    this.xdir = 0;
    this.ydir = 0;
    this.xlimit = (w / s) - 1;
    this.ylimit = (h / s) - 1;
    this.tail = [];
    this.dead = false;
    this.createFood();
    this.brain = brain ? brain : new NeuralNetwork(24, 18, 2, 4);
    this.moves = 250;
    this.score = 0;
    this.lifetime = 0;
    this.vision = new Array(24).fill(0);
    this.directions = [
      createVector(1,0),
      createVector(1,1),
      createVector(0,1),
      createVector(-1,1),
      createVector(-1,0),
      createVector(-1,-1),
      createVector(0,-1),
      createVector(1,-1)
      ];
  }
  
  clone() {
    //let c = new Snake(this.w, this.h, this.s, this.brain.clone());
    let c = new Snake(this.w, this.h, this.s, this.brain.clone());
    c.brain.mutate(0.05);
    return c;
  }
  
  fillVision() {
    // Index 0 - food distance
    // Index 1 - body distance
    // Index 2 - wall distance
    this.vision = new Array(24).fill(0);
    for (let i = 0; i < 8; i++) {
     let visionIdx = i * 3;
     let dir = this.directions[i];
     let pos = createVector(this.x, this.y);
     let dist = 0;
     pos = pos.add(dir);
     let foundFood = false;
     let foundBody = false;
     while(!this.checkWallCollision(pos)) {
       if (!foundFood && this.checkPtCollision(pos, this.food)) {
         foundFood = true;
         this.vision[visionIdx] = 1;
       }
       if(!foundBody && this.checkTailCollision(pos)) {
         foundBody = true;
         this.vision[visionIdx + 1] = 1;
       }
       dist++;
       pos = pos.add(dir);
     }
     this.vision[visionIdx + 2] = 1 / (1 + dist);
    }
  }
  
  think() {
    this.fillVision();
    print(this.vision);
    let outputs = this.brain.output(this.vision);
    print(outputs);
    let record = 0;
    let idx = 0;
    for (let i = 0; i < outputs.length; i++) {
      if (outputs[i] > record) {
        record = outputs[i];
        idx = i;
      }
    }    
    if (idx === 0 && this.xdir != -1) {
      this.setDir(1, 0);
    } else if (idx === 1 && this.xdir != 1) {
      this.setDir(-1, 0);
    } else if (idx === 2 && this.ydir != -1) {
      this.setDir(0, 1);
    } else if (idx === 3 && this.ydir != 1) {
      this.setDir(0, -1);
    }    
  }
  
  randomX() {
    return floor(random(this.w / this.s));
  }

  randomY() {
    return floor(random(this.h / this.s));
  }

  createFood() {
    let x = this.randomX();
    let y = this.randomY();
    this.food = createVector(x, y);
  }
  
  checkPtCollision(pt1, pt2) {
    return pt1.x === pt2.x && pt1.y === pt2.y;
  }

  checkCollision(pt) {
    let pos = {
      x: this.x + this.xdir,
      y: this.y + this.ydir
    };
    return this.checkPtCollision(pos, pt);
  }
  
  checkWallCollision(pt) {
    return pt.x < 0 || pt.x > this.xlimit || pt.y < 0 || pt.y > this.ylimit;
  }
      
  checkTailCollision(pt) {
    for (let i = 0; i < this.tail.length; i++) {
      if (this.checkPtCollision(pt, this.tail[i])) {
        return true;
      }
    }
    return false;
  }

  crossover(partner) {
    let brain = this.brain.crossover(partner.brain);
    let child = new Snake(this.w, this.h, this.s, brain);
    return child;
  }


  checkBorder() {
    let nextPos = {
      x: this.x + this.xdir,
      y: this.y + this.ydir
    };
    if (this.checkWallCollision(nextPos)) {
      this.dead = true;
      return;
    }
    if (this.checkTailCollision(nextPos)) {
      this.dead = true;
      return;
    }
    
  }

  setDir(xdir, ydir) {
    this.xdir = xdir;
    this.ydir = ydir;
  }

  updateTail() {
    for (let i = this.tail.length - 1; i > 0; i--) {
      this.tail[i].x = this.tail[i - 1].x;
      this.tail[i].y = this.tail[i - 1].y;
    }
    if (this.tail.length > 0) {
      this.tail[0].x = this.x;
      this.tail[0].y = this.y;
    }
  }

  drawTail() {
    for (let i = 0; i < this.tail.length; i++) {
      rect(this.tail[i].x * this.s, this.tail[i].y * this.s, this.s, this.s);
    }
  }

  update() {
    this.checkBorder();
    if (this.dead) return;
    this.updateTail();
    this.x += this.xdir;
    this.y += this.ydir;
    this.eat();
    this.moves--;
    this.lifetime++;
    if (this.moves === 0) {
      this.dead = true;
    }
  }
  
  eat() {
    if (this.x === this.food.x && this.y === this.food.y) {
      this.createFood();
      this.tail.push(createVector(this.x, this.y));
      this.moves += 100;      
      this.score++;
    }
  }
  
  calcFitness() {

    if (this.score < 10) {
      this.fitness = floor(this.lifetime * this.lifetime) * pow(2, this.score);
    } else {
      this.fitness = floor(this.lifetime * this.lifetime) * pow(2, 10) * (this.score - 9);
    }
    
  }
  
  draw() {
    noStroke();
    stroke(0);
    fill(255);
    rect(this.x * this.s, this.y * this.s, this.s, this.s);
    this.drawTail();
    noStroke();
    fill(255, 0, 0);
    rect(this.food.x * this.s, this.food.y * this.s, this.s, this.s);
  }


}