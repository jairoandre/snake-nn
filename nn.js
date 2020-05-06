class Matrix {
  constructor(r, c, randomize) {
    this.rows = r;
    this.cols = c;
    this.values = new Array(r)
      .fill()
      .map(() =>
        new Array(c).fill().map(() => (randomize ? random(-1, 1) : 0))
      );
  }

  dot(m) {
    const result = new Matrix(this.rows, m.cols);

    if (this.cols != m.rows) return result;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.values[i][k] * m.values[k][j];
        }
        result.values[i][j] = sum;
      }
    }

    return result;
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  toArray() {
    let result = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.push(this.values[i][j])
      }
    }
    return result;
  }

  activate() {
    let matrix = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        matrix.values[i][j] = max(0, this.values[i][j]);
      }
    }
    return matrix;
  }

  withBias() {
    let matrix = new Matrix(this.rows + 1, 1);
    for (let i = 0; i < this.rows; i++) {
      matrix.values[i][0] = this.values[i][0];
    }
    matrix.values[this.rows][0] = 1;
    return matrix;
  }

  mutate(rate) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (random() < rate) {
          let value = this.values[i][j] + randomGaussian()/5;
          this.values[i][j] = constrain(value, -1, 1);
        }
      }
    }
  }

  clone() {
    let matrix = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        matrix.values[i][j] = this.values[i][j];
      }
    }
    return matrix;
  }

  crossover(partner) {
    let child = new Matrix(this.rows, this.cols);
    let randC = floor(random(this.cols));
    let randR = floor(random(this.rows));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (i < randR || (i == randR && j <= randC)) {
          child.values[i][j] = this.values[i][j];
        } else {
          child.values[i][j] = partner.values[i][j];
        }
      }
    }
    return child;
  }

}

function matrixFromArray(arr) {
  let matrix = new Matrix(arr.length, 1);
  for (let i = 0; i < arr.length; i++) {
    matrix.values[i][0] = arr[i];
  }
  return matrix;
}


class NeuralNetwork {
  constructor(iSize, hSize, hLayers, oSize, forClone) {
    this.iSize = iSize;
    this.hSize = hSize;
    this.hLayers = hLayers;
    this.oSize = oSize;

    if (forClone === true) {
      return;
    }

    this.weights = new Array(hLayers + 1).fill();
    this.weights[0] = new Matrix(hSize, iSize + 1, true);
    for (let i = 1; i < hLayers; i++) {
      this.weights[i] = new Matrix(hSize, hSize + 1, true);
    }
    this.weights[hLayers] = new Matrix(oSize, hSize + 1, true);
  }

  mutate(rate) {
    this.weights.forEach((matrix) => matrix.mutate(rate));
  }

  clone() {
    let clone = new NeuralNetwork(this.iSize, this.hSize, this.hLayers, this.oSize, true);
    clone.weights = this.weights.map((matrix) => matrix.clone());
    return clone;
  }

  output(input) {
    //print(input);
    let inputMatrix = matrixFromArray(input).withBias();
    for (let i = 0; i < this.hLayers; i++) {
      let h_input = this.weights[i].dot(inputMatrix);
      let h_output = h_input.activate();
      inputMatrix = h_output.withBias();
    }
    let o_input = this.weights[this.hLayers].dot(inputMatrix);
    let output = o_input.activate();
    return output.toArray();
  }

  crossover(partner) {
    let child = new NeuralNetwork(this.iSize, this.hSize, this.hLayers, this.oSize);
    for (let i = 0; i < this.weights.length; i++) {
      child.weights[i] = this.weights[i].crossover(partner.weights[i]);
    }
    return child;
  }

}