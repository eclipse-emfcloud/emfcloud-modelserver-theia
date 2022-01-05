/********************************************************************************
 * Copyright (c) 2021-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { AnyObject, isString } from '../utils/type-util';

export type DataValueType = boolean | number | string;

export class ModelServerObject {
    readonly eClass: string;

    static is(object: unknown): object is ModelServerObject {
        return AnyObject.is(object) && isString(object, 'eClass');
    }
}

export class ModelServerReferenceDescription extends ModelServerObject {
    constructor(public eClass: string, public $ref: string) {
        super();
    }
}
