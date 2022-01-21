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
import { AddOperation, Operation, RemoveOperation, ReplaceOperation } from 'fast-json-patch';

import { ModelServerObjectV2, ModelServerReferenceDescriptionV2 } from '../model/base-model';
import { TypeGuard } from './type-util';

// Utility methods to create Json Patches

/**
 * The definition of a Type. Used e.g. to indicate which type of object
 * should be created, for a Create operation.
 */
export interface TypeDefinition {
    $type: string;
}

/**
 * Create a ReplaceOperation, to change the value of a property of the specified object.
 * @param modeluri the uri of the model to edit
 * @param object the object to edit
 * @param feature the property to edit
 * @param value the value to set
 * @returns The Json Patch ReplaceOperation to set the property.
 */
export function replace<T>(modeluri: string, object: ModelServerObjectV2, feature: string, value: T): ReplaceOperation<T> {
    return {
        op: 'replace',
        path: getPropertyPath(modeluri, object, feature),
        value: value
    };
}

/**
 * Create an AddOperation, to create a new object of the specified type, in the specified parent.
 * @param modeluri the uri of the model to edit
 * @param parent the parent in which the new element should be created
 * @param feature the property of the parent in which the new element should be added
 * @param $type the type of element to create
 * @param attributes the attributes to initialize for the new element
 * @returns The Json Patch AddOperation to create the element.
 */
export function create(modeluri: string, parent: ModelServerObjectV2, feature: string, $type: string, attributes?: any): AddOperation<TypeDefinition> {
    return {
        op: 'add',
        path: getPropertyPath(modeluri, parent, feature),
        value: {
            $type: $type,
            ...attributes
        }
    };
}

/**
 * Create an AddOperation, to add an existing object of the specified type, in the specified parent.
 * @param modeluri the uri of the model to edit
 * @param parent the parent in which the element should be added
 * @param feature the property of the parent in which the element should be added
 * @param value the element to add
 * @returns The Json Patch AddOperation to add the element in the parent.
 */
export function add(modeluri: string, parent: ModelServerObjectV2, feature: string,
    value: ModelServerObjectV2 | ModelServerReferenceDescriptionV2): AddOperation<ModelServerObjectV2> {
    return {
        op: 'add',
        path: getPropertyPath(modeluri, parent, feature),
        value: {
            $type: value.$type,
            $id: getObjectPath(modeluri, value)
        }
    };
}

/**
 * Create a RemoveOperation, to delete an object from the model.
 * @param modeluri the uri of the model to edit
 * @param object the object to remove from the model
 * @returns The Json Patch RemoveOperation to remove the element.
 */
export function deleteElement(modeluri: string, object: ModelServerObjectV2): RemoveOperation {
    return {
        op: 'remove',
        path: getObjectPath(modeluri, object)
    };
}

/**
 * Create a RemoveOperation, to remove a value from a list.
 * @param modeluri the uri of the model to edit
 * @param object the object from which a value will be removed
 * @param feature the property from which a value will be removed
 * @param index the index of the value to remove
 */
export function removeValueAt(modeluri: string, object: ModelServerObjectV2, feature: string, index: number): RemoveOperation {
    return {
        op: 'remove',
        path: getPropertyPath(modeluri, object, feature, index)
    };
}

/**
 * Create a RemoveOperation, to remove a value from a list.
 * @param modeluri the uri of the model to edit
 * @param object the object from which a value will be removed
 * @param feature the property from which a value will be removed
 * @param index the value to remove
 */
export function removeValue(modeluri: string, object: ModelServerObjectV2, feature: string, value: any): RemoveOperation | undefined {
    const index = findIndex(object, feature, value);
    if (index >= 0) {
        return removeValue(modeluri, object, feature, index);
    }
    return undefined;
}

/**
 * Create a RemoveOperation, to delete an object from the model.
 * @param modeluri the uri of the model to edit
 * @param objectToRemove the object to delete from the model
 */
export function removeObject(modeluri: string, objectToRemove: ModelServerObjectV2): RemoveOperation {
    return {
        op: 'remove',
        path: getObjectPath(modeluri, objectToRemove)
    };
}

export function getObjectPath(modeluri: string, object: ModelServerObjectV2 | ModelServerReferenceDescriptionV2): string {
    const id = ModelServerReferenceDescriptionV2.is(object) ? object.$ref : object.$id;
    return `${modeluri}#${id}`;
}

export function getPropertyPath(modeluri: string, object: ModelServerObjectV2, feature: string, index?: number): string {
    const indexSuffix = index === undefined ? '' : `/${index}`;
    return `${getObjectPath(modeluri, object)}/${feature}${indexSuffix}`;
}

function findIndex(object: ModelServerObjectV2, feature: string, value: any): number {
    const propertyValue = (object as any)[feature];
    if (Array.isArray(propertyValue)) {
        return propertyValue.indexOf(value);
    }
    return -1;
}

/**
 * Utility functions for working with JSON Patch operations.
 */
export namespace Operations {
    export function isOperation(object: any): object is Operation {
        return (
            'op' in object &&
            typeof object.op === 'string' && //
            'path' in object &&
            typeof object.path === 'string'
        );
    }

    export function isPatch(object: any): object is Operation[] {
        return (Array.isArray(object) && object.length === 0) || isOperation(object[0]);
    }

    /** Type guard testing whether an operation is a replace operation, with a nested guard on the value type. */
    export function isReplace(op: Operation, typeGuard: 'string'): op is ReplaceOperation<string>;
    export function isReplace(op: Operation, typeGuard: 'number'): op is ReplaceOperation<number>;
    export function isReplace(op: Operation, typeGuard: 'boolean'): op is ReplaceOperation<boolean>;
    export function isReplace<T = unknown>(op: Operation, typeGuard?: string | TypeGuard<T>): op is ReplaceOperation<T> {
        if (typeof typeGuard === 'function') {
            return op?.op === 'replace' && (!typeGuard || typeGuard(op.value));
        }
        if (!typeGuard) {
            return op?.op === 'replace';
        }
        return op?.op === 'replace' && typeof op.value === typeGuard;
    }
}
