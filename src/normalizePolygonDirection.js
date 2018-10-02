export function normalizePolygonDirection (polygon) {
  let xmax = -Infinity
  let xindex = -1

  for (let [i, [x]] of Object.entries(polygon)) {
    if (x > xmax) {
      xmax = x
      xindex = +i
    }
  }

  let prev = polygon[(polygon.length + xindex - 1) % polygon.length]
  let next = polygon[(polygon.length + xindex + 1) % polygon.length]

  let clockwise = prev[1] > next[1]

  if (clockwise) {
    return polygon
  } else {
    return polygon.reverse()
  }
}
