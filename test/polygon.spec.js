/* eslint-env: mocha */

import assert from 'assert'

import {SvgPath} from '../src/'
import {normalizePolygon} from '../src/normalizePolygon'

function toPolygon (string) {
  return [[0, 0], ...string.split(' ').map(string => string.split(',').map(parseFloat)), [0, 0]]
}

describe('SvgPath#getPolygons()', function () {
  describe('normalization', function () {
    it('with simple intersection', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('100,0 0,100 0,100 100,100')),
        toPolygon('100,0 50,50 100,100 0,100 50,50')
      )
    })
    it('with multiple intersections', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('100,0 0,100 100,200 0,200 100,100')),
        toPolygon('100,0 50,50 100,100 50,150 100,200 0,200 50,150 0,100 50,50')
      )
    })
    it('with multiple intersections in same segment', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('50,0 50,150 0,100 100,100 100,50 0,50')),
        toPolygon('50,0 50,50 100,50 100,100 50,100 50,150 0,100 50,150 50,50 0,50')
      )
    })
    it('with segment intersection (diff direction)', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('50,50 50,100 100,150 50,200 0,150 50,100 50,50 100,0')),
        toPolygon('100,0 50,50 50,100 100,150 50,200 0,150 50,100 50,50')
      )
    })
    it('with partial segment intersection (diff direction)', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('50,75 50,125 100,150 50,200 0,150 50,100 50,50 100,0')),
        toPolygon('100,0 50,50 50,125 100,150 50,200 0,150 50,100 50,75')
      )
    })
    it('with multi-segment intersection (diff direction)', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('50,50 50,75 50,100 100,150 50,200 0,150 50,100 50,75 50,50 100,0')),
        toPolygon('100,0 50,50 50,75 50,100 100,150 50,200 0,150 50,100 50,75 50,50')
      )
    })
    it('with segment intersection (same direction)', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('100,50 100,100 0,50 100,50 100,100 0,100')),
        toPolygon('100,50 0,50 100,100 100,50 100,100 0,100')
      )
    })
    it('with partial segment intersection (same direction)', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('100,25 100,75 0,50 100,50 100,100 0,100')),
        toPolygon('100,25 100,50 0,50 100,75 100,50 100,100 0,100')
      )
    })
    it('with multi-segment intersection (same direction)', function () {
      assert.deepStrictEqual(
        normalizePolygon(toPolygon('100,50 100,75 100,100 0,50 100,50 100,75 100,100 0,100')),
        toPolygon('100,50 0,50 100,100 100,75 100,50 100,75 100,100 0,100')
      )
    })
  })
})
