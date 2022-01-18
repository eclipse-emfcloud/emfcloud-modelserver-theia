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
import { Operation } from 'fast-json-patch';

import { ServerConfiguration, SubscriptionOptions } from './model-server-client-api-v1';
import { Model, ModelServerMessage } from './model-server-message';
import { ModelServerCommand } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { SubscriptionListener } from './subscription-listener';
import { AnyObject, TypeGuard } from './utils/type-util';

/**
 * Basic client API to interact with a model server that conforms to the Modelserver API Version 2.
 */
export interface ModelServerClientApiV2 {
    /**
     * The `initialize` method should be executed before any other requests to the model server.
     * The given base url should point to the location of the model server API entry point.
     * (e.g. `http://localhost:8081/api/v1/`). Once the initialization is completed the client is expected
     * to be ready and should be able to handle REST requests to & responses from the model server.
     * Any requests to the model server before the client has been initialized are expected to fail (i.e. throw an error)
     * @param baseUrl Url pointing to the API entry point
     * @param defaultFormat Optional fallback format that should used when a request method is invoked and no explicit format argument
     *                      has been passed.
     */
    initialize(baseUrl: string, defaultFormat?: string): void | Promise<void>;

    /**
     * Retrieves all available models of the current workspace.
     * @param format
     */
    getAll(): Promise<Model[]>;
    /**
     * 3
     * @param format
     */
    getAll<M>(typeGuard: TypeGuard<M>): Promise<Model<M>[]>;
    getAll(format: string): Promise<Model<string>[]>;

    get(modeluri: string, format?: string): Promise<AnyObject>;
    get<M>(modeluri: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    getModelUris(): Promise<string[]>;

    getElementById(modeluri: string, elementid: string, format?: string): Promise<AnyObject>;
    getElementById<M>(modeluri: string, elementid: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    getElementByName(modeluri: string, elementname: string, format?: string): Promise<AnyObject>;
    getElementByName<M>(modeluri: string, elementname: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    delete(modeluri: string): Promise<boolean>;

    close(modeluri: string): Promise<boolean>;

    create(modeluri: string, model: AnyObject | string, format?: string): Promise<AnyObject>;
    create<M>(modeluri: string, model: AnyObject | string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    update(modeluri: string, model: AnyObject | string, format?: string): Promise<AnyObject>;
    update<M>(modeluri: string, model: AnyObject | string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    save(modeluri: string): Promise<boolean>;

    saveAll(): Promise<boolean>;

    validate(modeluri: string): Promise<Diagnostic>;

    getValidationConstraints(modeluri: string): Promise<string>;

    getTypeSchema(modeluri: string): Promise<string>;

    getUiSchema(schemaname: string): Promise<string>;

    configureServer(configuration: ServerConfiguration): Promise<boolean>;

    ping(): Promise<boolean>;

    edit(modeluri: string, patch: Operation | Operation[], format?: string): Promise<boolean>;
    edit(modeluri: string, command: ModelServerCommand, format?: string): Promise<boolean>;

    undo(modeluri: string): Promise<string>;

    redo(modeluri: string): Promise<string>;

    // WebSocket connection
    subscribe(modeluri: string, listener: SubscriptionListener, options?: SubscriptionOptions): SubscriptionListener;

    send(modelUri: string, message: ModelServerMessage): void;
    unsubscribe(modelUri: string): void;
}

export namespace ModelServerClientApiV2 {
    export const API_ENDPOINT = '/api/v2';
}
