/********************************************************************************
 * Copyright (c) 2021 CS GROUP - France and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *
 * Contributors:
 *    Vincent HEMERY (CS GROUP - France) - initial API and implementation
 ********************************************************************************/
import { Diagnostic as EMFDiagnostic } from '@eclipse-emfcloud/modelserver-theia/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { ProblemManager } from '@theia/markers/lib/browser';
import { inject, injectable } from 'inversify';
import { Diagnostic as LangServerDiagnostic } from 'vscode-languageserver-types';
import { DiagnosticAdapter } from './diagnostic-adapter';

@injectable()
export class DiagnosticManager {

    /** The problem manager to which we delegate */
    @inject(ProblemManager)
    protected readonly problemManager: ProblemManager;

    /**
     * Replaces the current markers for the given model URI with markers generated from the given diagnostic.
     * @param modelUri the model URI concerned by diagnostic
     * @param diagnostic the root diagnostic (children diagnostics will be collected if needed)
     */
    setDiagnostic(modelUri: URI, diagnostic: EMFDiagnostic): void {
        const leaves: EMFDiagnostic[] = EMFDiagnostic.collectLeaves(diagnostic);
        this.setDiagnosticLeaves(modelUri, leaves);
    }

    /**
     * Replaces the current markers for the given model URI with markers generated from the given diagnostics.
     * @param modelUri the model URI concerned by diagnostic
     * @param diagnostics the diagnostics to take (children diagnostics will be collected if needed)
     */
    setDiagnostics(modelUri: URI, diagnostics: EMFDiagnostic[]): void {
        const leavesPerDiagnostic: EMFDiagnostic[][] = diagnostics.map(d => EMFDiagnostic.collectLeaves(d));
        const leaves: EMFDiagnostic[] = leavesPerDiagnostic.reduce((accumulator, values) => accumulator.concat(values), []);
        this.setDiagnosticLeaves(modelUri, leaves);
    }

    /**
     * Replaces the current markers for the given model URI with markers generated from the given leaf diagnostics.
     * @param modelUri the model URI concerned by diagnostic
     * @param diagnostics the leaf diagnostics to take as is
     */
    protected setDiagnosticLeaves(modelUri: URI, diagnostics: EMFDiagnostic[]): void {
        // first clean old markers
        this.problemManager.cleanAllMarkers(modelUri);
        // then convert diagnostics
        const convertedDiagnosticsPerElementId: Map<string, LangServerDiagnostic[]> = new Map();
        diagnostics.forEach(d => {
            const converted = DiagnosticAdapter.emfToLangServerDiagnostic(d);
            // check not undefined...
            if (LangServerDiagnostic.is(converted)) {
                if (!convertedDiagnosticsPerElementId.has(d.id)) {
                    convertedDiagnosticsPerElementId.set(d.id, []);
                }
                convertedDiagnosticsPerElementId.get(d.id)!.push(converted);
            }
        });
        // and log them by element id as owner
        for (const [id, converteds] of convertedDiagnosticsPerElementId) {
            this.problemManager.setMarkers(modelUri, id, converteds);
        }
    }
}
