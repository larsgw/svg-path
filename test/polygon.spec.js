/* eslint-env: mocha */

import assert from 'assert'

import {SvgPath} from '../src/'
import {normalizePolygon} from '../src/normalizePolygon'

function toPolygon (string) {
  return [[0, 0], ...string.split(' ').map(string => string.split(',').map(parseFloat)), [0, 0]]
}

function toString (polygon) {
  return polygon.map(point => point.join('\t')).join('\n')
}

function assertParse (a, b) {
  assert.deepStrictEqual(SvgPath.parsePath(a), b)
}

function assertNormalization (a, b) {
  assert.strictEqual(
    toString(normalizePolygon(toPolygon(a))),
    toString(toPolygon(b))
  )
}

describe('SvgPath.parsePath()', function () {
  it('with param space separator', function () {
    assertParse('m 100 100', [{type: 'm', key: 'M', args: [100, 100]}])
  })
  it('with param comma separator', function () {
    assertParse('m 100,100', [{type: 'm', key: 'M', args: [100, 100]}])
  })
  it('with param comma and space separator', function () {
    assertParse('m 100 , 100', [{type: 'm', key: 'M', args: [100, 100]}])
  })
  it('with sign number and no separator', function () {
    assertParse('m 100-100', [{type: 'm', key: 'M', args: [100, -100]}])
    assertParse('m 100+100', [{type: 'm', key: 'M', args: [100, 100]}])
  })
  it('with decimal number', function () {
    assertParse('m 100.0 100', [{type: 'm', key: 'M', args: [100, 100]}])
    assertParse('m 100. 100', [{type: 'm', key: 'M', args: [100, 100]}])
    assertParse('m .1 100', [{type: 'm', key: 'M', args: [0.1, 100]}])
  })
  it('with signed number', function () {
    assertParse('m -100 100', [{type: 'm', key: 'M', args: [-100, 100]}])
    assertParse('m +100 100', [{type: 'm', key: 'M', args: [100, 100]}])
  })
  it('with exponent', function () {
    assertParse(
      'm 10e1,100e0',
      [{type: 'm', key: 'M', args: [100, 100]}]
    )
  })
  it('with signed exponent', function () {
    assertParse('m 1000e-1,100e-0', [{type: 'm', key: 'M', args: [100, 100]}])
    assertParse('m 10e+1,100e+0', [{type: 'm', key: 'M', args: [100, 100]}])
  })
  it('everything bagel (or number)', function () {
    assertParse('m +1.1e1 -.1e+01', [{type: 'm', key: 'M', args: [11, -1]}])
  })
})

describe('SvgPath#getPolygons()', function () {
  describe('normalization', function () {
    it('with simple intersection', function () {
      assertNormalization(
        '100,0 0,100 100,100',
        '100,0 50,50 100,100 0,100 50,50'
      )
    })
    it('with multiple intersections', function () {
      assertNormalization(
        '100,0 0,100 100,200 0,200 100,100',
        '100,0 50,50 100,100 50,150 100,200 0,200 50,150 0,100 50,50'
      )
    })
    it('with multiple intersections in same segment', function () {
      assertNormalization(
        '100,100 100,0 0,25 75,100 100,0',
        '20,20 100,0 80,80 20,20 0,25 75,100 80,80 100,100 100,0'
      )
    })
    it('with multiple intersections in same segment (reverse)', function () {
      assertNormalization(
        '100,100 100,0 75,100 0,25 100,0',
        '100,0 20,20 80,80 100,0 100,100 80,80 75,100 0,25 20,20'
      )
    })
    it('with multiple intersections in same point', function () {
      assertNormalization(
        '50,0 50,100 0,100 100,0 100,100',
        '50,0 50,50 100,0 100,100 50,50 50,100 0,100 50,50'
      )
    })
    it('with point intersection', function () {
      assertNormalization(
        '50,0 50,100 100,50 50,50 0,50',
        '50,0 50,50 100,50 50,100 50,50 0,50'
      )
    })
    it('with point-point intersection', function () {
      assertNormalization(
        '50,0 50,50 50,100 100,50 50,50 0,50',
        '50,0 50,50 100,50 50,100 50,50 0,50'
      )
    })
    it('with segment intersection (diff direction)', function () {
      assertNormalization(
        '50,50 50,100 100,150 50,200 0,150 50,100 50,50 100,0',
        '100,0 50,50 50,100 100,150 50,200 0,150 50,100 50,50'
      )
    })
    it('with partial segment intersection (diff direction)', function () {
      assertNormalization(
        '50,75 50,125 100,150 50,200 0,150 50,100 50,50 100,0',
        '100,0 50,50 50,125 100,150 50,200 0,150 50,100 50,75'
      )
    })
    it('with multi-segment intersection (diff direction)', function () {
      assertNormalization(
        '50,50 50,75 50,100 100,150 50,200 0,150 50,100 50,75 50,50 100,0',
        '100,0 50,50 50,100 100,150 50,200 0,150 50,100 50,50'
      )
    })
    it('with segment intersection (same direction)', function () {
      assertNormalization(
        '100,50 100,100 0,50 100,50 100,100 0,100',
        '100,50 0,50 100,100 100,50 100,100 0,100'
      )
    })
    it('with partial segment intersection (same direction)', function () {
      assertNormalization(
        '100,25 100,75 0,50 100,50 100,100 0,100',
        '100,25 100,50 0,50 100,75 100,50 100,100 0,100'
      )
    })
    it('with multi-segment intersection (same direction)', function () {
      assertNormalization(
        '100,50 100,75 100,100 0,50 100,50 100,75 100,100 0,100',
        '100,50 0,50 100,100 100,50 100,100 0,100'
      )
    })
    it('with point-segment non-intersection', function () {
      let polygon = '100,0 100,100 0,100 100,50'
      assertNormalization(polygon, polygon)
    })
    it('with point-point non-intersection', function () {
      let polygon =
      assertNormalization(
        '100,0 100,50 100,100 0,100 100,50',
        '100,0 100,100 0,100 100,50'
      )
    })
    it('with segment-segment non-intersection', function () {
      let polygon = '100,0 100,100 0,100 100,75 100,25'
      assertNormalization(polygon, polygon)
    })
  })
})
