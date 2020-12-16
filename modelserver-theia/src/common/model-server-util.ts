/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { DataValueType, ModelServerCommand, ModelServerObject, ModelServerReferenceDescription } from './model-server-api';

const isNumberArray =
    (array: number[] | ModelServerReferenceDescription[]): array is number[] => array.every((e: number | ModelServerReferenceDescription) => typeof e === 'number');

const isModelServerObjectArray =
    (array: DataValueType[] | ModelServerObject[]): array is ModelServerObject[] => array.every((e: any) => typeof e === 'object' && e.eClass !== undefined);

const isModelServerReferenceDescriptionArray = (array: DataValueType[] | ModelServerReferenceDescription[]):
    array is ModelServerReferenceDescription[] => array.every((e: any) => typeof e === 'object' && e.eClass !== undefined && e.$ref !== undefined);

export namespace ModelServerCommandUtil {
    export function createRemoveCommand(owner: ModelServerReferenceDescription, feature: string, indices: number[]): ModelServerCommand;
    export function createRemoveCommand(owner: ModelServerReferenceDescription, feature: string, objectValues: ModelServerReferenceDescription[]): ModelServerCommand;
    export function createRemoveCommand(owner: ModelServerReferenceDescription, feature: string, toDelete: number[] | ModelServerReferenceDescription[]): ModelServerCommand {
        let command: ModelServerCommand;
        if (isNumberArray(toDelete)) {
            command = {
                eClass: 'http://www.eclipsesource.com/schema/2019/modelserver/command#//Command',
                type: 'remove',
                owner,
                feature,
                indices: toDelete
            };
        } else {
            command = {
                eClass: 'http://www.eclipsesource.com/schema/2019/modelserver/command#//Command',
                type: 'remove',
                owner,
                feature,
                objectValues: toDelete
            };
        }
        return command;
    }

    export function createAddCommand(owner: ModelServerReferenceDescription, feature: string, toAdd: DataValueType[] | ModelServerObject[]): ModelServerCommand;
    export function createAddCommand(owner: ModelServerReferenceDescription, feature: string, toAdd: DataValueType[] | ModelServerObject[], index: number): ModelServerCommand;
    export function createAddCommand(owner: ModelServerReferenceDescription, feature: string, toAdd: DataValueType[] | ModelServerObject[], index?: number): ModelServerCommand {
        const command: ModelServerCommand = {
            eClass: 'http://www.eclipsesource.com/schema/2019/modelserver/command#//Command',
            type: 'add',
            owner,
            feature
        };
        if (index !== undefined) {
            command.indices = [index];
        }
        if (isModelServerObjectArray(toAdd)) {
            const objectValues: ModelServerReferenceDescription[] = toAdd.map((o, i) => ({ eClass: o.eClass, $ref: `//@objectsToAdd.${i}` }));
            command.objectsToAdd = toAdd;
            command.objectValues = objectValues;
        } else {
            command.dataValues = toAdd;
        }
        return command;
    }

    export function createSetCommand(
        owner: ModelServerReferenceDescription, feature: string, changedValues: DataValueType[] | ModelServerReferenceDescription[]): ModelServerCommand {
        const command: ModelServerCommand = {
            eClass: 'http://www.eclipsesource.com/schema/2019/modelserver/command#//Command',
            type: 'set',
            owner,
            feature
        };
        if (isModelServerReferenceDescriptionArray(changedValues)) {
            command.objectValues = changedValues;
        } else {
            command.dataValues = changedValues;
        }
        return command;
    }
}
