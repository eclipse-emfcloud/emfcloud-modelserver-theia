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
import { ModelServerObject, ModelServerReferenceDescription } from './base-model';

export namespace ChangePackage {
    export const NS_URI = 'http://www.eclipse.org/emf/2003/Change';

    export enum ChangeKind {
        ADD, REMOVE, MOVE
    }
}

export class FeatureMapEntry extends ModelServerObject {
    static readonly URI = ChangePackage.NS_URI + '#//FeatureMapEntry';
    eClass = FeatureMapEntry.URI;

    featureName?: string;
    dataValue?: string;
    value?: any;
    feature: any;
    referenceValue?: any;

    static is(object?: any): object is FeatureMapEntry {
        return ModelServerObject.is(object) && object.eClass === FeatureMapEntry.URI;
    }
}

export class ListChange {
    kind?: ChangePackage.ChangeKind;
    dataValues?: string[];
    index?: number = -1;
    moveToIndex?: number;
    values?: any[];
    referenceValues?: ModelServerReferenceDescription[];
    feature?: any;
    featureMapEntryValues?: FeatureMapEntry[];
}

export class ResourceChange extends ModelServerObject {
    static readonly URI = ChangePackage.NS_URI + '#//ResourceChange';
    eClass = ResourceChange.URI;

    resourceURI?: string;
    resource?: any;
    value?: any;
    listChanges?: ListChange[];

    static is(object?: any): object is ResourceChange {
        return ModelServerObject.is(object) && object.eClass === ResourceChange.URI;
    }
}

export class FeatureChange {
    static readonly URI = ChangePackage.NS_URI + '#//FeatureChange';
    eClass = ChangeDescription.URI;

    featureName?: string;
    dataValue?: string;
    set?: boolean;
    value?: any;
    feature?: ModelServerReferenceDescription;
    referenceValue?: ModelServerReferenceDescription;
    listChanges?: ListChange[];
}

export class EObjectToChangesMapEntry extends ModelServerObject {
    static readonly URI = ChangePackage.NS_URI + '#//EObjectToChangesMapEntry';
    eClass = ChangeDescription.URI;

    key: ModelServerReferenceDescription;
    value?: FeatureChange[];

    static is(object?: any): object is EObjectToChangesMapEntry {
        return ModelServerObject.is(object) && object.eClass === EObjectToChangesMapEntry.URI
            && 'key' in object && ModelServerReferenceDescription.is(object['key']);
    }
}

export class ChangeDescription extends ModelServerObject {
    static readonly URI = ChangePackage.NS_URI + '#//ChangeDescription';
    eClass = ChangeDescription.URI;

    objectsChanges?: EObjectToChangesMapEntry[];
    objectsToDetach?: ModelServerObject[];
    objectsToAttach?: ModelServerObject[];
    resourceChanges?: ResourceChange[];

    static is(object?: any): object is ChangeDescription {
        return ModelServerObject.is(object) && object.eClass === ChangeDescription.URI;
    }
}

