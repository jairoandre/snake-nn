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
  yield "18"
  yield "0 1800"
  yield "300 1200"
  yield "1000 1550"
  yield "2000 1200"
  yield "2500 1650"
  yield "3700 220"
  yield "4700 220"
  yield "4750 1000"
  yield "4700 1650"
  yield "4000 1700"
  yield "3700 1600"
  yield "3750 1900"
  yield "4000 2100"
  yield "4900 2050"
  yield "5100 1000"
  yield "5500 500"
  yield "6200 800"
  yield "6999 600"
  yield "6500 2000 0 0 1200 0 0";
}

const test1Gen = test2();
//const test1Gen = test2();

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
  for (let i = 1, j = 2; i < (len - 2); i = j++) {
    let curr = vertices[i];
    let next = vertices[j];
    if (curr.y === next.y) {
      return [curr, next];
    }
  }

  return null;
}

function distToPlane(p0, line) {
  let p1 = line[0];
  let p2 = line[1];
  let dx = 0;
  let dy = p0.y - p1.y;
  // point is left outside?
  if (p0.x < p1.x) {
    dx = p0.x - p1.x;
  }
  // point is right outside?
  if (p0.x > p2.x) {
    dx = p2.x - p0.x;
  }
  return Math.sqrt((dx * dx) + (dy * dy));
}

function randomThrust(pa) {
  let ra = pa ? Math.min(Math.abs(pa) + 15, 90) : 90;
  let a = round(random(-ra, ra));
  let p = round(random([3, 3, 4, 4, 4, 4, 4, 2, 1, 0]));
  return [a, p];
}

function randomThrusts(len) {
  let n = len;
  let result = [];
  let previous;
  while(n--) {
    let t = randomThrust(previous ? previous.a : undefined);
    result.push(t);
    previous = t;
  }
  return result;
}