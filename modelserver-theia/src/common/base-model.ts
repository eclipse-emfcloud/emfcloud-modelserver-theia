/********************************************************************************
 * Copyright (c) 2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/

export type DataValueType = boolean | number | string;

export class ModelServerObject {
    readonly eClass: string;

    static is(object?: any): object is ModelServerObject {
        return object !== undefined && object.eClass !== undefined && typeof object.eClass === 'string';
    }
}

export class ModelServerReferenceDescription extends ModelServerObject {
    constructor(public eClass: string, public $ref: string) {
        super();
    }
}
