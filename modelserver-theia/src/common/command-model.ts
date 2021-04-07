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
import { DataValueType, ModelServerObject, ModelServerReferenceDescription } from './base-model';
import { ChangeDescription } from './change-model';
import { isModelServerObjectArray, isModelServerReferenceDescriptionArray, isNumberArray } from './model-server-util';

export namespace ModelServerCommandPackage {
    export const NS_URI = 'http://www.eclipse.org/emfcloud/modelserver/command';
}

export class ModelServerCommand extends ModelServerObject {
    static readonly URI = ModelServerCommandPackage.NS_URI + '#//Command';
    eClass = ModelServerCommand.URI;

    owner?: ModelServerReferenceDescription;
    feature?: string;
    indices?: number[];
    dataValues?: DataValueType[];
    objectValues?: ModelServerReferenceDescription[];
    objectsToAdd?: ModelServerObject[];

    constructor(public type: string, public properties?: { [key: string]: string }) {
        super();
    }

    public setProperty(key: string, value: string): void {
        if (this.properties === undefined) {
            this.properties = {};
        }
        this.properties[key] = value;
    }

    public getProperty(key: string): undefined | string {
        return this.properties && this.properties[key];
    }

    static is(object?: any): object is ModelServerCommand {
        return ModelServerObject.is(object) && object.eClass === ModelServerCommand.URI
            && 'type' in object && typeof object['type'] === 'string';
    }
}

export class CompoundCommand extends ModelServerCommand {
    static readonly TYPE = 'compound';
    static readonly URI = ModelServerCommandPackage.NS_URI + '#//CompoundCommand';
    eClass = CompoundCommand.URI;

    constructor(public commands: ModelServerCommand[] = []) {
        super(CompoundCommand.TYPE);
    }

    static is(object?: any): object is ModelServerCommand {
        return ModelServerObject.is(object) && object.eClass === CompoundCommand.URI
            && 'type' in object && typeof object['type'] === 'string' && object['type'] === CompoundCommand.TYPE
            && 'commands' in object;
    }
}

export class RemoveCommand extends ModelServerCommand {
    static readonly TYPE = 'remove';

    constructor(owner: ModelServerReferenceDescription, feature: string, indices: number[]);
    constructor(owner: ModelServerReferenceDescription, feature: string, objectValues: ModelServerReferenceDescription[]);
    constructor(public owner: ModelServerReferenceDescription, public feature: string, toDelete: number[] | ModelServerReferenceDescription[]) {
        super(RemoveCommand.TYPE);
        if (isNumberArray(toDelete)) {
            this.indices = toDelete;
        } else {
            this.objectValues = toDelete;
        }
    }

    static is(object?: any): object is ModelServerCommand {
        return ModelServerCommand.is(object) && object.type === RemoveCommand.TYPE;
    }
}

export class AddCommand extends ModelServerCommand {
    static readonly TYPE = 'add';

    constructor(owner: ModelServerReferenceDescription, feature: string, toAdd: DataValueType[] | ModelServerObject[]);
    constructor(owner: ModelServerReferenceDescription, feature: string, toAdd: DataValueType[] | ModelServerObject[], index: number);
    constructor(public owner: ModelServerReferenceDescription, public feature: string, toAdd: DataValueType[] | ModelServerObject[], index?: number) {
        super(AddCommand.TYPE);
        if (index) {
            this.indices = [index];
        }
        if (isModelServerObjectArray(toAdd)) {
            const objectValues: ModelServerReferenceDescription[] = toAdd.map((o, i) => new ModelServerReferenceDescription(o.eClass, `//@objectsToAdd.${i}`));
            this.objectsToAdd = toAdd;
            this.objectValues = objectValues;
        } else {
            this.dataValues = toAdd;
        }
    }

    static is(object?: any): object is ModelServerCommand {
        return ModelServerCommand.is(object) && object.type === AddCommand.TYPE;
    }
}

export class SetCommand extends ModelServerCommand {
    static readonly TYPE = 'set';

    constructor(public owner: ModelServerReferenceDescription, public feature: string, changedValues: DataValueType[] | ModelServerReferenceDescription[]) {
        super(SetCommand.TYPE);
        if (isModelServerReferenceDescriptionArray(changedValues)) {
            this.objectValues = changedValues;
        } else {
            this.dataValues = changedValues;
        }
    }

    static is(object?: any): object is ModelServerCommand {
        return ModelServerCommand.is(object) && object.type === SetCommand.TYPE;
    }
}

export namespace CommandExecutionType {
    export const EXECCUTE = 'execute';
    export const UNDO = 'undo';
    export const REDO = 'redo';
}

export class CommandExecutionResult implements ModelServerObject {
    static readonly URI = ModelServerCommandPackage.NS_URI + '#//CommandExecutionResult';
    eClass = CommandExecutionResult.URI;

    affectedObjects?: ModelServerReferenceDescription[];
    details?: { [key: string]: string };

    constructor(public type: string, public source: ModelServerCommand, public changeDescription: ChangeDescription) {
    }

    static is(object?: any): object is CommandExecutionResult {
        return ModelServerObject.is(object) && object.eClass === CommandExecutionResult.URI
            && 'type' in object && typeof object['type'] === 'string'
            && 'source' in object
            && 'changeDescription' in object && ChangeDescription.is(object['changeDescription']);
    }
}
