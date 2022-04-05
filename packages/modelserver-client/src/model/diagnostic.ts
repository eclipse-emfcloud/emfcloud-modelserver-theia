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
import { AnyObject, isArray, isNumber, isString } from '../utils/type-util';

/** The bit mask value for okay severity */
export const OK = 0x0;
/** The bit mask value for informational message severity */
export const INFO = 0x1;
/** The bit mask value for warning message severity */
export const WARNING = 0x2;
/** The bit mask value for error message severity */
export const ERROR = 0x4;
/** The bit mask value for canceled diagnosis severity */
export const CANCEL = 0x8;
/**
 * Information about the result of a model validation.
 * @see org.eclipse.emf.common.util.Diagnostic
 */
export interface Diagnostic {
    /** indicator of the severity of the problem */
    severity: number;

    /** message describing the situation */
    message: string;

    /** unique identifier of the source */
    source: string;

    /** source-specific identity code */
    code: number;

    /** the relevant low-level exception */
    exception?: Error | any;

    /**
     * The arbitrary associated list of data.
     * The first element is typically the object that is the primary source of the problem;
     * the second element is typically some object describing the problematic feature or aspect of the primary source,
     * and the remaining elements are additional objects associated with or describing the problem.
     */
    data: any[];

    /** list of child Diagnostic */
    children: Diagnostic[];

    /** The id or URI fragment of the validated model element */
    id: string;
}

export namespace Diagnostic {
    /**
     * Typeguard function to check wether the given object is of type {@link Diagnostic}.
     * @param object the object to check
     * @returns the given object as {@link Diagnostic} or `false`
     */
    export function is(object: unknown): object is Diagnostic {
        return (
            AnyObject.is(object) &&
            isNumber(object, 'severity') &&
            isString(object, 'message') &&
            isString(object, 'source') &&
            isNumber(object, 'code') &&
            isArray(object, 'data') &&
            isArray(object, 'children') &&
            isString(object, 'id')
        );
    }

    /**
     * Recompute the severity of a composed diagnostic by looking at its children.
     * Contrary to the org.eclipse.emf.common.util.BasicDiagnostic.recomputeSeverity() implementation,
     * we combine the severity values and do not just keep the highest number value.
     * This means the severity number will keep trace of all non-OK severities found in children.
     * If you need a simple severity value, just use getSeverityLabel method afterward.
     * @param diagnostic diagnostic to analyze
     * @returns the updated severity value
     */
    export function recomputeSeverity(diagnostic: Diagnostic): number {
        if (diagnostic.children.length > 0) {
            // reset this diagnostic's severity
            diagnostic.severity = OK;
            // then use children to update with bit OR
            diagnostic.children.forEach(child => {
                const childSeverity = recomputeSeverity(child);
                diagnostic.severity = diagnostic.severity | childSeverity;
            });
        }
        // return updated severity
        return diagnostic.severity;
    }

    /**
     * Get the label severity value of the diagnostic using masks.
     * @param diagnostic diagnostic to analyze
     * @returns severity label which the mask matches the severity number
     */
    export function getSeverityLabel(diagnostic: Diagnostic): 'OK' | 'INFO' | 'WARNING' | 'ERROR' | 'CANCEL' {
        const severityCode = diagnostic.severity;
        if ((severityCode & CANCEL) > 0) {
            return 'CANCEL';
        } else if ((severityCode & ERROR) > 0) {
            return 'ERROR';
        } else if ((severityCode & WARNING) > 0) {
            return 'WARNING';
        } else if ((severityCode & INFO) > 0) {
            return 'INFO';
        } else {
            return 'OK';
        }
    }

    /**
     * Collect leaf diagnostics, which are children diagnostics without children.
     * An OK diagnostic without children is not returned.
     * @param diagnostic diagnostic to analyze
     * @returns diagnostics without children (eventually including this one or empty)
     */
    export function collectLeaves(diagnostic: Diagnostic): Diagnostic[] {
        if (diagnostic.children.length > 0) {
            const leavesByChild = diagnostic.children.map(collectLeaves);
            return leavesByChild.reduce((accumulator, values) => accumulator.concat(values), []);
        } else if (diagnostic.severity > 0) {
            return [diagnostic];
        } else {
            return [];
        }
    }

    /**
     * Get an OK diagnostic.
     *
     * @returns an OK diagnostic
     */
    export function ok(): Diagnostic {
        return {
            severity: OK,
            code: 0,
            message: 'OK',
            source: '',
            data: [],
            children: [],
            id: ''
        };
    }

    /**
     * Merge any number of `diagnostics` (even zero) into a single result.
     * Any OK diagnostics are elided and the result may itself just be OK.
     *
     * @param diagnostics diagnostics to merge
     * @returns the merged diagnostic
     */
    export function merge(...diagnostics: Diagnostic[]): Diagnostic {
        const nonOK = diagnostics.filter(d => d && d.severity > OK);
        if (nonOK.length === 0) {
            return ok();
        }
        if (nonOK.length === 1) {
            return nonOK[0];
        }

        const max = worstOf(diagnostics);

        // Recompute IDs of the diagnostics because they are now in
        // a new tree structure and their paths have changed.
        return recomputeIDs({
            severity: max.severity,
            message: `Diagnosis of ${nonOK.length} problems.`,
            source: max.source,
            code: max.code,
            data: [],
            children: nonOK,
            id: '/'
        });
    }

    /**
     * Find the worst severity in a list of `diagnostics`.
     *
     * @param diagnostics an array of diagnostics, possibly empty
     * @returns the first diagnostic of the great severity amongst the `diagnostics`
     *        or else an OK diagnostic if none
     */
    export function worstOf(diagnostics: Diagnostic[]): Diagnostic {
        if (!diagnostics || diagnostics.length === 0) {
            return ok();
        }

        let result = diagnostics[0];

        for (const d of diagnostics) {
            if (d.severity > result.severity) {
                result = d;
            }
            if (d.severity === CANCEL) {
                break; // Cannot get worse than this
            }
        }

        return result;
    }

    /**
     * Assign IDs of the diagnostics in a tree according to the EMF
     * path-structured URI fragment algorithm.
     */
    function recomputeIDs(diagnostic: Diagnostic, base = '/'): Diagnostic {
        diagnostic.id = base;

        diagnostic.children?.forEach((child, i) => recomputeIDs(child, `${base}/@children.${i}`));

        return diagnostic;
    }
}
