/********************************************************************************
 * Copyright (c) 2021-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
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

/**
 * A ModelServer model element. ModelServerElements may be actual objects,
 * or references to an object defined in another part of the model, or even
 * in a different model.
 */
export abstract class ModelServerElement {
    readonly $type: string;

    static is(object: unknown): object is ModelServerElement {
        return AnyObject.is(object) && isString(object, '$type');
    }
}

/**
 * A ModelServer object.
 */
export class ModelServerObjectV2 extends ModelServerElement {
    readonly $id: string;

    static is(object: unknown): object is ModelServerObjectV2 {
        return AnyObject.is(object) && isString(object, '$type') && isString(object, '$id');
    }
}

/**
 * A ModelServer Reference. References an object defined in another part of the model,
 * or even in a different model.
 */
export class ModelServerReferenceDescriptionV2 extends ModelServerElement {
    constructor(public $type: string, public $ref: string) {
        super();
    }

    static is(object: unknown): object is ModelServerReferenceDescriptionV2 {
        return AnyObject.is(object) && isString(object, '$type') && isString(object, '$ref');
    }
}
