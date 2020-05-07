function calcSnakesFitness(savedSnakes) {
  let total = 0;
  let bestSnake = null;
  sketchBestSnake = null;
  CURRENT_RECORD = 0;

  let fitness = savedSnakes.map((s) => {
    s.calcFitness();
    if (s.fitness > RECORD) {
      RECORD = s.fitness;
    }
    if (s.fitness > CURRENT_RECORD) {
      CURRENT_RECORD = s.fitness;
      bestSnake = s;
    }
    total += s.fitness;
    return s.fitness;
  });

  if (bestSnake) {
    sketchBestSnake = bestSnake.cloneForReplay();
  }
  return total;
}

function nextGeneration(savedSnakes, totalFitness) {
  let newSnakes = new Array(populationSlider.value()).fill().map(() => {
    let snake1 = selectSnake(savedSnakes, totalFitness);
    let snake2 = selectSnake(savedSnakes, totalFitness);
    let child = snake1.crossover(snake2);
    child.brain.mutate(0.05);
    return child;
  });
  return newSnakes;
}

function selectSnake(savedSnakes, sumFitness) {
  let rand = random(sumFitness);
  let summation = 0;
  for (let i = 0; i < savedSnakes.length; i++) {
    let currentSnake = savedSnakes[i];
    summation += currentSnake.fitness;
    if (summation > rand) {
      return currentSnake.clone();
    }
  }
  return savedSnakes[0].clone();
}
