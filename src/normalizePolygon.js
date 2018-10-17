function isOnLineSegment ([x, y], a, b) {
  let xmin = Math.min(a[0], b[0])
  let xmax = Math.max(a[0], b[0])
  let ymin = Math.min(a[1], b[1])
  let ymax = Math.max(a[1], b[1])

  return x >= xmin && x <= xmax && y >= ymin && y <= ymax
}

function getIntersection ([xc, yc], [xd, yd], cache) {
  let p = xc * cache[0] + yc * cache[1] + cache[2]
  let q = xd * cache[0] + yd * cache[1] + cache[2]
  let r = p / (p - q)

  if (!isFinite(r)) {
    return p === 0 && q === 0
  }

  return [
    xc + (xd - xc) * r,
    yc + (yd - yc) * r
  ]
}

export function getPolygonIntersections (polygon) {
  // line segments are indexed by the first point in the polygon that it's part of
  // intersection = [[x, y], segmentA, segmentB]
  let intersections = []
  let caches = []

  // a = 1st point of 1st line segment, b = 2nd point of 1st line segment,
  // c = 1st point of 2nd line segment, d = 2nd point of 2nd line segment
  for (let c = 0; c < polygon.length - 1; c++) {
    let d = c + 1
    let [xc, yc] = polygon[c]
    let [xd, yd] = polygon[d]
    caches.push([
      yd - yc,
      xc - xd,
      yc * xd - xc * yd
    ])

    for (let a = 0; a < c - 1; a++) {
      let b = a + 1
      let intersection = getIntersection([xc, yc], [xd, yd], caches[a])

      // no intersection
      if (intersection === false) {
        continue
      }

      // infinite intersections
      if (intersection === true) {
        if (isOnLineSegment(polygon[c], polygon[a], polygon[b])) {
          intersections.push([polygon[c], a, c])
        } else if (isOnLineSegment(polygon[d], polygon[a], polygon[c])) {
          intersections.push([polygon[d], a, c])
        } else {
          // line segments don't overlap
        }
        continue
      }

      let [xi, yi] = intersection

      // intersection with line but not line segments & intersection at endpoint
      let rightBound = Math.min(Math.max(polygon[a][0], polygon[a][1]), Math.max(xc, xd))
      let leftBound = Math.max(Math.min(polygon[a][0], polygon[a][1]), Math.min(xc, xd))
      if (xi <= leftBound || xi >= rightBound) {
        continue
      }

      // intersection is between begin and endpoint of polygon, and
      // polygon begins and ends in the same point
      if (a === 0 && c === polygon.length - 2 && polygon[c][0] === polygon[a][0] && polygon[c][1] === polygon[a][1]) {
        continue
      }

      intersections.push([[xi, yi], a, c])
    }
  }

  return intersections
}

export function removePolygonIntersections (polygon) {
  let intersections = getPolygonIntersections(polygon)
  // line segment index info changes :(
  let indexTransforms = []
  // takes an index (i) and previous intersection-removing bounds (b, d)
  // if i >= d (upper bound), only the two added points are taken into account
  // if i < b (lower bound), the index stays the same
  // else, if d > i >= b (between bounds)
  //   a. new i is a + the distance between (i, d)           : b - 1 + (d - i)
  //   b. one extra point is added                           : b + (d - i)
  //   c. points are reversed so i, being the first point of : b + (d - i) -1
  //      a line segment is now the second point. To get the
  //      new one denoting the line segment, it's i - 1
  //   This evaluates to                                     : b + d - i - 1
  const applyTransform = (i, [b, d]) => i >= d ? i + 2 : i >= b ? b + d - i - 1 : i

  for (let [point, a, c] of intersections) {
    a = indexTransforms.reduce(applyTransform, a)
    c = indexTransforms.reduce(applyTransform, c)
    let b = a + 1
    let d = c + 1
    polygon = [
      ...polygon.slice(0, b),
      point,
      ...polygon.slice(b, d).reverse(),
      point,
      ...polygon.slice(d)
    ]
    indexTransforms.push([b, d])
  }
  return polygon
}

export function removeRedundantPoints (polygon) {
  return polygon.filter(([x, y], i) => {
    if (i === 0) {
      return true
    }

    // duplicate points
    let [xp, yp] = polygon[i - 1]
    if (xp === x && yp === y) {
      return false
    }

    if (i === polygon.length - 1) {
      return true
    }

    // redundant points (point of 180deg)
    let [xn, yn] = polygon[i + 1]
    if (((xp - x) / (yp - y)) === ((x - xn) / (y - yn))) {
      return false
    }

    return true
  })
}

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

export function normalizePolygon (polygon) {
  return polygon
    |> removePolygonIntersections
    |> removeRedundantPoints
    |> normalizePolygonDirection
}
