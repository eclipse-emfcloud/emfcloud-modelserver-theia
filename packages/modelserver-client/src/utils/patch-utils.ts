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
import { AddOperation, Operation, RemoveOperation, ReplaceOperation } from 'fast-json-patch';
import URI from 'urijs';

import { ModelServerObjectV2, ModelServerReferenceDescriptionV2 } from '../model/base-model';
import { AnyObject, TypeGuard } from './type-util';

// Json Patch Operation types

const REPLACE = 'replace';
const ADD = 'add';
const REMOVE = 'remove';

/**
 * The definition of a Type. Used e.g. to indicate which type of object
 * should be created, for a Create operation.
 */
export interface TypeDefinition {
    $type: string;
}

//
// Functions to generate Json Patch operations, specific to the ModelServer syntax.
// These operations can only be used with the model server, as they use a custom
// syntax to define the Path attribute, which relies on the ModelURI and Object $id.
//

/**
 * Create a ReplaceOperation, to change the value of a property of the specified object.
 * @param modeluri the uri of the model to edit
 * @param object the object to edit
 * @param feature the property to edit
 * @param value the value to set
 * @returns The Json Patch ReplaceOperation to set the property.
 */
export function replace<T>(modeluri: URI, object: ModelServerObjectV2, feature: string, value: T): ReplaceOperation<T> {
    return {
        op: REPLACE,
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
export function create(
    modeluri: URI,
    parent: ModelServerObjectV2,
    feature: string,
    $type: string,
    attributes?: AnyObject
): AddOperation<TypeDefinition> {
    return {
        op: ADD,
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
export function add(
    modeluri: URI,
    parent: ModelServerObjectV2,
    feature: string,
    value: ModelServerObjectV2 | ModelServerReferenceDescriptionV2
): AddOperation<ModelServerObjectV2> {
    return {
        op: ADD,
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
export function deleteElement(modeluri: URI, object: ModelServerObjectV2): RemoveOperation {
    return {
        op: REMOVE,
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
export function removeValueAt(modeluri: URI, object: ModelServerObjectV2, feature: string, index: number): RemoveOperation {
    return {
        op: REMOVE,
        path: getPropertyPath(modeluri, object, feature, index)
    };
}

/**
 * Create a RemoveOperation, to remove a value from a list.
 * @param modeluri the uri of the model to edit
 * @param object the object from which a value will be removed
 * @param feature the property from which a value will be removed
 * @param value the value to remove
 */
export function removeValue(modeluri: URI, object: ModelServerObjectV2, feature: string, value: AnyObject): RemoveOperation | undefined {
    const index = findIndex(object, feature, value);
    if (index >= 0) {
        return removeValueAt(modeluri, object, feature, index);
    }
    return undefined;
}

/**
 * Create a RemoveOperation, to delete an object from the model.
 * @param modeluri the uri of the model to edit
 * @param objectToRemove the object to delete from the model
 */
export function removeObject(modeluri: URI, objectToRemove: ModelServerObjectV2): RemoveOperation {
    return {
        op: REMOVE,
        path: getObjectPath(modeluri, objectToRemove)
    };
}

/**
 * Return the custom Json Path for this object. The result is a path that
 * can be used to define Json Patch operations. It uses object ids ($id
 * attribute) and ModelURI, which are not standard Json Patch concepts.
 * As such, operations using this path will only work with the ModelServer.
 * They won't work with a standard Json Patch library.
 * @param modeluri The URI of the model to edit.
 * @param object The object.
 * @returns the custom Json Path for this object.
 */
function getObjectPath(modeluri: URI, object: ModelServerObjectV2 | ModelServerReferenceDescriptionV2): string {
    const id = ModelServerReferenceDescriptionV2.is(object) ? object.$ref : object.$id;
    return modeluri.clone().fragment(id).toString();
}

/**
 * Return the custom Json Path for this property. The result is a path that
 * can be used to define Json Patch operations. It uses object ids ($id
 * attribute) and ModelURI, which are not standard Json Patch concepts.
 * As such, operations using this path will only work with the ModelServer.
 * They won't work with a standard Json Patch library.
 * @param modeluri The URI of the model to edit.
 * @param object The object.
 * @param feature The name of the property to edit.
 * @param index An optional index, for list properties.
 * @returns the custom Json Path to edit this property.
 */
function getPropertyPath(modeluri: URI, object: ModelServerObjectV2, feature: string, index?: number): string {
    const indexSuffix = index === undefined ? '' : `/${index}`;
    return `${getObjectPath(modeluri, object)}/${feature}${indexSuffix}`;
}

function findIndex(object: ModelServerObjectV2, feature: string, value: AnyObject): number {
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
    /**
     * Tests is the given object is a Json Patch {@link Operation}
     * @param object the object to test
     * @returns true if the object is an Operation, false otherwise.
     */
    export function isOperation(object: unknown): object is Operation {
        if (AnyObject.is(object)) {
            return (
                'op' in object &&
                typeof object.op === 'string' && //
                'path' in object &&
                typeof object.path === 'string'
            );
        } else {
            return false;
        }
    }

    /**
     * Tests is the given object is a Json Patch (Which is an array of {@link Operation Operations})
     * @param object the object to test
     * @returns true if the object is a Json Patch, false otherwise.
     */
    export function isPatch(object: unknown): object is Operation[] {
        return Array.isArray(object) && (object.length === 0 || isOperation(object[0]));
    }

    /** Type guard testing whether an operation is an add operation, with a nested guard on the value type. */
    export function isAdd(op: Operation, typeGuard: 'string'): op is AddOperation<string>;
    export function isAdd(op: Operation, typeGuard: 'number'): op is AddOperation<number>;
    export function isAdd(op: Operation, typeGuard: 'boolean'): op is AddOperation<boolean>;
    export function isAdd<T = unknown>(op: Operation, typeGuard: TypeGuard<T>): op is AddOperation<T>;
    export function isAdd<T = unknown>(op: Operation, typeGuard?: string | TypeGuard<T>): op is AddOperation<T> {
        if (typeof typeGuard === 'function') {
            return op?.op === ADD && (!typeGuard || typeGuard(op.value));
        }
        if (!typeGuard) {
            return op?.op === ADD;
        }
        return op?.op === ADD && typeof op.value === typeGuard;
    }

    /** Type guard testing whether an operation is a replace operation, with a nested guard on the value type. */
    export function isReplace(op: Operation, typeGuard: 'string'): op is ReplaceOperation<string>;
    export function isReplace(op: Operation, typeGuard: 'number'): op is ReplaceOperation<number>;
    export function isReplace(op: Operation, typeGuard: 'boolean'): op is ReplaceOperation<boolean>;
    export function isReplace<T = unknown>(op: Operation, typeGuard: TypeGuard<T>): op is ReplaceOperation<T>;
    export function isReplace<T = unknown>(op: Operation, typeGuard?: string | TypeGuard<T>): op is ReplaceOperation<T> {
        if (typeof typeGuard === 'function') {
            return op?.op === REPLACE && (!typeGuard || typeGuard(op.value));
        }
        if (!typeGuard) {
            return op?.op === REPLACE;
        }
        return op?.op === REPLACE && typeof op.value === typeGuard;
    }

    /** Type guard testing whether an operation is a remove operation. */
    export function isRemove(op: Operation): op is RemoveOperation {
        return op?.op === REMOVE;
    }
}
