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
import { Diagnostic as LangServerDiagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-types';

/**
 * Range pointing to a model element
 */
export interface ModelElementRange extends Range {
    /** The model element's URI fragment */
    uriFragment: string;
}

export namespace ModelElementRange {
    export function create(uriFragment: string): ModelElementRange {
        return {
            uriFragment: uriFragment,
            ...Range.create(0, 0, 0, 0)
        };
    }
    /**
     * Checks whether the given literal conforms to the ModelElementRange interface.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    export function is(value: any): value is ModelElementRange {
        return 'uriFragment' in value && Range.is(value);
    }
}

export namespace DiagnosticAdapter {
    /**
     * Transforms an EMF diagnostic to a language server diagnostic
     * @param diagnostic the EMF diagnostic to transform
     */
    export function emfToLangServerDiagnostic(diagnostic: EMFDiagnostic): LangServerDiagnostic | undefined {
        let severity: DiagnosticSeverity;
        switch (EMFDiagnostic.getSeverityLabel(diagnostic)) {
            case 'ERROR':
                severity = DiagnosticSeverity.Error;
                break;
            case 'WARNING':
                severity = DiagnosticSeverity.Warning;
                break;
            case 'INFO':
                severity = DiagnosticSeverity.Information;
                break;
            case 'OK':
                severity = DiagnosticSeverity.Hint;
                break;
            default:
                // this diagnostic should not be converted
                return undefined;
        }
        const range = ModelElementRange.create(diagnostic.id);
        const converted: LangServerDiagnostic = {
            ...diagnostic,
            range: range,
            severity: severity,
            relatedInformation: []
        };
        return converted;
    }
}
