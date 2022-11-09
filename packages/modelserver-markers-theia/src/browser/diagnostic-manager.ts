/********************************************************************************
 * Copyright (c) 2021-2022 CS GROUP - France and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import { Diagnostic as EMFDiagnostic } from '@eclipse-emfcloud/modelserver-client';
import { URI as TheiaURI } from '@theia/core/lib/common/uri';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ProblemManager } from '@theia/markers/lib/browser';
import { Diagnostic as LangServerDiagnostic } from 'vscode-languageserver-types';

import { DiagnosticAdapter } from './diagnostic-adapter';

@injectable()
export class DiagnosticManager {
    /** The problem manager to which we delegate */
    @inject(ProblemManager)
    protected readonly problemManager: ProblemManager;

    /**
     * Replaces the current markers for the given model URI with markers generated from the given diagnostic.
     * @param modeluri the model URI concerned by diagnostic
     * @param diagnostic the root diagnostic (children diagnostics will be collected if needed)
     */
    setDiagnostic(modeluri: TheiaURI, diagnostic: EMFDiagnostic): void {
        const leaves: EMFDiagnostic[] = EMFDiagnostic.collectLeaves(diagnostic);
        this.setDiagnosticLeaves(modeluri, leaves);
    }

    /**
     * Replaces the current markers for the given model URI with markers generated from the given diagnostics.
     * @param modeluri the model URI concerned by diagnostic
     * @param diagnostics the diagnostics to take (children diagnostics will be collected if needed)
     */
    setDiagnostics(modeluri: TheiaURI, diagnostics: EMFDiagnostic[]): void {
        const leavesPerDiagnostic: EMFDiagnostic[][] = diagnostics.map(d => EMFDiagnostic.collectLeaves(d));
        const leaves: EMFDiagnostic[] = leavesPerDiagnostic.reduce((accumulator, values) => accumulator.concat(values), []);
        this.setDiagnosticLeaves(modeluri, leaves);
    }

    /**
     * Replaces the current markers for the given model URI with markers generated from the given leaf diagnostics.
     * @param modeluri the model URI concerned by diagnostic
     * @param diagnostics the leaf diagnostics to take as is
     */
    protected setDiagnosticLeaves(modeluri: TheiaURI, diagnostics: EMFDiagnostic[]): void {
        // first clean old markers
        this.problemManager.cleanAllMarkers(modeluri);
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
            this.problemManager.setMarkers(modeluri, id, converteds);
        }
    }
}
