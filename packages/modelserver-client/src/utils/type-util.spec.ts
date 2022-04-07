/********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import { expect } from 'chai';

import { encode } from './type-util';

describe('tests for type-util', () => {
    describe('encode', () => {
        const emptyArray: any[] = [];
        const tags = ['high-prio', 'red'];
        // eslint-disable-next-line no-null/no-null
        const nada = null; // JSON uses null
        const emptyObj = {};

        it('JSON v1 as JSON v1', () => {
            const object = { eClass: 'Foo', name: 'test', nested: [{ eClass: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }] };
            const encoded = encode('json')(object);
            expect(encoded).to.be.equal(encoded);
        });

        it('JSON v1 as JSON v2', () => {
            const object = { eClass: 'Foo', name: 'test', nested: [{ eClass: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }] };
            const expected = { $type: 'Foo', name: 'test', nested: [{ $type: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }] };
            const encoded = encode('json-v2')(object);
            expect(encoded).to.be.eql(expected);
        });

        it('JSON v2 as JSON v1', () => {
            const object = { $type: 'Foo', name: 'test', nested: [{ $type: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }] };
            const expected = {
                eClass: 'Foo',
                name: 'test',
                nested: [{ eClass: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }]
            };
            const encoded = encode('json')(object);
            expect(encoded).to.be.eql(expected);
        });

        it('JSON v2 as JSON v2', () => {
            const object = { $type: 'Foo', name: 'test', nested: [{ $type: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }] };
            const encoded = encode('json-v2')(object);
            expect(encoded).to.be.equal(encoded);
        });
    });

    describe('encode string', () => {
        const emptyArray: any[] = [];
        const tags = ['high-prio', 'red'];
        // eslint-disable-next-line no-null/no-null
        const nada = null; // JSON uses null
        const emptyObj = {};

        it('JSON v1 as JSON v1', () => {
            const object = JSON.stringify({
                eClass: 'Foo',
                name: 'test',
                nested: { eClass: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }
            });
            const encoded = encode('json')(object);
            expect(encoded).to.be.equal(encoded);
        });

        it('JSON v1 as JSON v2', () => {
            const object = JSON.stringify({
                eClass: 'Foo',
                name: 'test',
                nested: { eClass: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }
            });
            const expected = { $type: 'Foo', name: 'test', nested: { $type: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj } };
            const encoded = encode('json-v2')(object);
            expect(encoded).to.be.a('string');
            expect(JSON.parse(encoded as string)).to.be.eql(expected);
        });

        it('JSON v2 as JSON v1', () => {
            const object = JSON.stringify({
                $type: 'Foo',
                name: 'test',
                nested: { $type: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }
            });
            const expected = { eClass: 'Foo', name: 'test', nested: { eClass: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj } };
            const encoded = encode('json')(object);
            expect(encoded).to.be.a('string');
            expect(JSON.parse(encoded as string)).to.be.eql(expected);
        });

        it('JSON v2 as JSON v2', () => {
            const object = JSON.stringify({
                $type: 'Foo',
                name: 'test',
                nested: { $type: 'Nested', name: 'inner', tags, emptyArray, nada, emptyObj }
            });
            const encoded = encode('json-v2')(object);
            expect(encoded).to.be.equal(encoded);
        });
    });
});
