export function normalizePolygonDirection (polygon) {
  let xmax = -Infinity
  let ymax
  let xindex = -1

  for (let [i, [x, y]] of Object.entries(polygon)) {
    if (x > xmax) {
      xmax = x
      ymax = y
      xindex = +i
    }
  }

  let clockwise
  for (let i = 1; clockwise === undefined && i < (polygon.length + 1) / 2; i++) {
    let prev = polygon[(polygon.length + xindex - i) % polygon.length]
    let next = polygon[(polygon.length + xindex + i) % polygon.length]

    if (prev[1] !== next[1]) {
      clockwise = prev[1] < next[1]
    } else if (prev[0] !== next[0] && prev[1] !== ymax) {
      clockwise = (prev[1] < ymax) === (prev[0] > next[0])
    } else {
      continue
    }
  }

  // clockwise is only undefined when the polygon is just a polyline,
  // in which case the direction *is* undefined

  if (clockwise) {
    return polygon
  } else {
    return polygon.reverse()
  }
}
