/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const isParsedObject = require('../index.js');
const { describe, it } = require('mocha');
const { expect } = require('chai');

describe('isParsedObject', () => {
  it('not parsed', () => {
    expect(isParsedObject({})).to.equal(false);
    expect(isParsedObject([])).to.equal(false);
    expect(isParsedObject(/./)).to.equal(false);
  });
  it('non object value', () => {
    expect(isParsedObject(null)).to.equal(false);
    expect(isParsedObject(void 0)).to.equal(false); // eslint-disable-line no-void
    expect(isParsedObject(1)).to.equal(false);
    expect(isParsedObject('str')).to.equal(false);
    expect(isParsedObject(true)).to.equal(false);
    expect(isParsedObject(false)).to.equal(false);
  });
  it('parsed object', () => {
    expect(isParsedObject(JSON.parse('{}'))).to.equal(true);
    expect(isParsedObject(JSON.parse('{ "a": "b" }'))).to.equal(true);
  });
  it('parsed array', () => {
    expect(isParsedObject(JSON.parse('[]'))).to.equal(true);
    expect(isParsedObject(JSON.parse('[ "a", "b" ]'))).to.equal(true);
  });
  it('parsed primitives', () => {
    expect(isParsedObject(JSON.parse('"a"'))).to.equal(false);
    expect(isParsedObject(JSON.parse('42'))).to.equal(false);
    expect(isParsedObject(JSON.parse('null'))).to.equal(false);
  });
  it('custom reviver', () => {
    function reviver(key, value) {
      if (typeof value === 'object' && value && value.type === 'Date') {
        return new Date(value.value);
      }
      return value;
    }

    const parsed = JSON.parse(
      '{ "a": {}, "b": { "type": "Date", "value": 1000 } }',
      reviver);
    expect(isParsedObject(parsed)).to.equal(true);
    expect(isParsedObject(parsed.a)).to.equal(true);
    expect(isParsedObject(parsed.b)).to.equal(true);
    expect(parsed.b instanceof Date).to.equal(true);
    expect(parsed.b.toISOString()).to.equal('1970-01-01T00:00:01.000Z');
  });
  it('round trip', () => {
    const parsed = JSON.parse('{ "foo": "bar" }');
    expect(JSON.stringify(parsed)).to.equal('{"foo":"bar"}');
  });

  describe('idioms', () => {
    const parsed = JSON.parse(`{
      "a": 1,
      "b": 2,
      "c": 3,
      "d": 4,
      "e": { "foo": "bar" }
    }`);

    it('cherrypicked', () => {
      const { a, b } = parsed;
      expect(isParsedObject({ a, b })).to.equal(false);
    });
    it('rest', () => {
      const { c, d, ...rest } = parsed;
      expect(isParsedObject({ z: c + d, ...rest })).to.equal(true);
    });
    it('mass-assign', () => {
      const userObject = { e: {} };
      const combinationUserE = Object.assign({}, parsed, userObject);
      const combinationParsedE = Object.assign({}, userObject, parsed);
      expect(isParsedObject(combinationUserE)).to.equal(true);
      expect(isParsedObject(combinationParsedE)).to.equal(true);
      expect(isParsedObject(combinationUserE.e)).to.equal(false);
      expect(isParsedObject(combinationParsedE.e)).to.equal(true);
    });
    it('with loop', () => {
      const loopedInto = {};
      for (const [ key, value ] of Object.entries(parsed)) {
        loopedInto[key] = value;
      }
      // KNOWN FAILURE
      expect(isParsedObject(loopedInto)).to.equal(false);
    });
  });
});
