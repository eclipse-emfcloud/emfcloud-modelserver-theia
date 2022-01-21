/*********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
import { expect } from 'chai';
import { Diagnostic, ERROR, OK, WARNING } from './diagnostic';

describe('tests for Diagnostic', () => {

    it('ok', () => {
        const ok = Diagnostic.ok();

        expect(ok.severity).to.be.equal(OK);
        expect(ok.source).to.be.empty;
        expect(ok.code).to.be.equal(0);
        expect(ok.children).to.be.empty;
        expect(ok.data).to.be.empty;
        expect(ok.exception).to.be.undefined;
        expect(ok.message).to.be.equal('OK');
    });

    describe('merge', () => {
        it('no args', () => {
            const merged = Diagnostic.merge();
            expect(merged).to.be.eql(Diagnostic.ok());
        });

        it('one arg', () => {
            const only = d(WARNING, 'This is a warning.');
            const merged = Diagnostic.merge(only);
            expect(merged).to.be.eql(only);
        });

        it('several args', () => {
            const warning = { ...d(WARNING, 'Not so bad.'), source: 'a' };
            const ok =  { ...d(OK, 'It\'s okay.'), source: 'b' };
            const error =  { ...d(ERROR, 'Pretty bad.'), source: 'c' };
            const merged = Diagnostic.merge(warning, ok, error);
            expect(merged.severity).to.be.equal(ERROR);
            expect(merged.source).to.be.equal('c');
            expect(merged.children).to.be.eql([warning, error]);
        });
    });

    describe('worstOf', () => {
        it('no args', () => {
            const worst = Diagnostic.worstOf([]);
            expect(worst).to.be.eql(Diagnostic.ok());
        });

        it('one arg', () => {
            const only = d(WARNING, 'This is a warning.');
            const worst = Diagnostic.worstOf([only]);
            expect(worst).to.be.equal(only);
        });

        it('several args', () => {
            const warning = { ...d(WARNING, 'Not so bad.'), source: 'a' };
            const ok =  { ...d(OK, 'It\'s okay.'), source: 'b' };
            const error =  { ...d(ERROR, 'Pretty bad.'), source: 'c' };
            const worst = Diagnostic.worstOf([warning, ok, error]);
            expect(worst).to.be.equal(error);
        });
    });
});

function d(severity: number, message = 'A problem occurred.', ...children: Diagnostic[]): Diagnostic {
    return {
        severity,
        message,
        data: [],
        children,
        code: 0,
        source: 'test',
        id: ''
    };
}
