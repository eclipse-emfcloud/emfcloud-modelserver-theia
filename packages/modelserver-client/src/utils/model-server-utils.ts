/********************************************************************************
 * Copyright (c) 2019-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { DataValueType, ModelServerObject, ModelServerReferenceDescription } from '../model/base-model';

export function isNumberArray(array: Array<number | ModelServerReferenceDescription>): array is number[] {
    return array.every((e: number | ModelServerReferenceDescription) => typeof e === 'number');
}

export function isModelServerObjectArray(array: Array<DataValueType | ModelServerObject>): array is ModelServerObject[] {
    return array.every(ModelServerObject.is);
}

export function isModelServerReferenceDescriptionArray(
    array: Array<DataValueType | ModelServerReferenceDescription>
): array is ModelServerReferenceDescription[] {
    return array.every(ModelServerReferenceDescription.is);
}
