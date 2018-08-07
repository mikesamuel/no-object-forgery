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

/**
 * A symbol that should only be added to objects whose
 * properties come from an external string, or which include
 * uncherry-picked properties from such an object.
 */
const PARSER_OUTPUT_SYMBOL = Symbol('parserOutput');

function markingReviver(key, value) {
  if (value && typeof value === 'object') {
    // HACK: This might fail if optReviver freezes values.
    // Could use a WeakSet instead but then tainting won't follow
    // mass assignments like Object.assign.
    value[PARSER_OUTPUT_SYMBOL] = true;
    // This affect arrays.  That seems fine.
  }
  return value;
}

// Monkeypatch JSON.parse to add a symbol to structured values
const jsonParseTrusted = JSON.parse;
JSON.parse = function parse(jsonString, optReviver) {
  const reviver = typeof optReviver === 'function' ?
    (key, value) => markingReviver(key, optReviver(key, value)) :
    markingReviver;
  return jsonParseTrusted(jsonString, reviver);
};
JSON.parseTrusted = jsonParseTrusted;
// TODO: Other common JavaScript object parsing vectors.
// * XHR response with type application/json?
// * JSON injected into a <script> body by a server-side template.

/**
 * True if x was parsed from external strings or was mass assigned
 * (Object.assign) own properties from such an object.
 *
 * CAVEAT: If x might come from a different Realm, which has its own
 * monkeypatched JSON, then this would have to change to recognize other
 * properties.
 */
function isParsedObject(x) {
  // eslint-disable-next-line no-implicit-coercion
  return !!(x && typeof x === 'object' && PARSER_OUTPUT_SYMBOL in x);
}

module.exports = isParsedObject;
