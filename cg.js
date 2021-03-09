class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Point(this.x, this.y);
  }
}

function vec(x, y) {
  return new Point(x, y);
}

function* test1() {
  yield "22";
  yield "0 450";
  yield "300 750";
  yield "1000 450";
  yield "1500 650";
  yield "1800 850";
  yield "2000 1950";
  yield "2200 1850";
  yield "2400 2000";
  yield "3100 1800";
  yield "3150 1550";
  yield "2500 1600";
  yield "2200 1550";
  yield "2100 750";
  yield "2200 150";
  yield "3200 150";
  yield "3500 450";
  yield "4000 950";
  yield "4500 1450";
  yield "5000 1550";
  yield "5500 1500";
  yield "6000 950";
  yield "6999 1750";
  yield "6500 2600 -20 0 1000 45 0";
}

function* test2() {
  yield "18";
  yield "0 1800";
  yield "300 1200";
  yield "1000 1550";
  yield "2000 1200";
  yield "2500 1650";
  yield "3700 220";
  yield "4700 220";
  yield "4750 1000";
  yield "4700 1650";
  yield "4000 1700";
  yield "3700 1600";
  yield "3750 1900";
  yield "4000 2100";
  yield "4900 2050";
  yield "5100 1000";
  yield "5500 500";
  yield "6200 800";
  yield "6999 600";
  yield "6500 2000 0 0 1200 0 0";
}

const test1Gen = test1();

function readline() {
  const r = test1Gen.next();
  if (r.done) return gameState();
  else return r.value;
}

function checkInside(point, vertices) {
  let len = vertices.length;
  let minX, minY, maxX, maxY;
  let n = len;
  while (n--) {
    let q = vertices[n];
    minX = minX ? Math.min(minX, q.x) : q.x;
    minY = minY ? Math.min(minY, q.y) : q.y;
    maxX = maxX ? Math.max(maxX, q.x) : q.x;
    maxY = maxY ? Math.max(maxY, q.y) : q.y;
  }
  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY)
    return false;
  let inside = false;
  for (let i = 0, j = len - 1; i < len; j = i++) {
    if (
      vertices[i].y > point.y != vertices[j].y > point.y &&
      point.x <
        ((vertices[j].x - vertices[i].x) * (point.y - vertices[i].y)) /
          (vertices[j].y - vertices[i].y) +
          vertices[i].x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function getPlaneSegment(vertices) {
  let len = vertices.length;
  // Ignore the first and last vertices
  for (let i = 1; i < len - 2; i++) {
    let curr = vertices[i];
    let next = vertices[i + 1];
    if (curr.y === next.y) {
      return [curr, next];
    }
  }

  return null;
}

function lineLength(p1, p2) {
  let a = p1.x - p2.x;
  let b = p1.y - p2.y;
  return Math.sqrt(a * a + b * b);
}

function randomCmd(prev) {
  if (prev) {
    let a = randIn(-15, 15);
    let p = randIn(-1, 1);
    a += prev[0];
    p += prev[1];
    return [compress(a, -90, 90), compress(p, 2, 4)];
  } else {
    let a = randIn(-90, 90);
    let p = randIn(0, 4);
    return [a, p];
  }
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

function hitTheGround(p1, q1, vertices) {
  let len = vertices.length;
  for (let i = 1; i < len - 2; i++) {
    let p2 = vertices[i];
    let q2 = vertices[i + 1];
    if (doIntersect(p1, q1, p2, q2)) {
      return true;
    }
  }
  return false;
}

function calcSurfaceLength(vertices) {
  let distances = [];
  for (let i = 1; i < vertices.length - 2; i++) {
    let p1 = vertices[i];
    let q1 = vertices[i + 1];
    distances.push(lineLength(p1, q1));
  }
  return distances;
}
