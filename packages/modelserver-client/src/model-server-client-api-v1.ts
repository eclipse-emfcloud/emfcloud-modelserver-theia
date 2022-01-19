/*********************************************************************************
 * Copyright (c) 2021-2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
import { MessageDataMapper, Model, ModelServerMessage } from './model-server-message';
import { ModelServerCommand } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { SubscriptionListener } from './subscription-listener';
import { AnyObject, TypeGuard } from './utils/type-util';

/**
 * Basic client API to interact with a model server that conforms to the Modelserver API Version 1
 */
export interface ModelServerClientApiV1 {
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
     * Retrieves all available {@link Model}s of the current workspace as plain JSON objects.
     * @returns An array of all available models as a promise.
     */
    getAll(): Promise<Model[]>;
    /**
     * Retrieves all available {@link Model}s of the current workspace as typed JSON objects using
     * a given typeguard.
     * @param typeGuard An array of all available models as a promise. The promise is rejected if the typecheck fails.
     */
    getAll<M>(typeGuard: TypeGuard<M>): Promise<Model<M>[]>;
    /**
     * Retrieves all available {@link Model}s of the current workspace in string representation derived from a given format (e.g. 'xml' or 'json').
     * @param format The desired format.
     * @returns A string array of all available models as a promise.
     */
    getAll(format: string): Promise<Model<string>[]>;

    get(modeluri: string,): Promise<AnyObject>;
    get<M>(modeluri: string, typeGuard: TypeGuard<M>,): Promise<M>;
    get(modeluri: string, format: string): Promise<string>;

    getModelUris(): Promise<string[]>;

    getElementById(modeluri: string, elementid: string): Promise<AnyObject>;
    getElementById<M>(modeluri: string, elementid: string, typeGuard: TypeGuard<M>): Promise<M>;
    getElementById(modeluri: string, elementid: string, format: string): Promise<string>;

    getElementByName(modeluri: string, elementname: string): Promise<AnyObject>;
    getElementByName<M>(modeluri: string, elementname: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;
    getElementByName(modeluri: string, elementname: string, format: string): Promise<string>;

    delete(modeluri: string): Promise<boolean>;

    close(modeluri: string): Promise<boolean>;

    create(modeluri: string, model: AnyObject | string): Promise<AnyObject>;
    create<M>(modeluri: string, model: AnyObject | string, typeGuard: TypeGuard<M>): Promise<M>;
    create(modeluri: string, model: AnyObject | string, format: string): Promise<string>;

    update(modeluri: string, model: AnyObject | string): Promise<AnyObject>;
    update<M>(modeluri: string, model: string | string, typeGuard: TypeGuard<M>): Promise<M>;
    update(modeluri: string, model: AnyObject | string, format?: string): Promise<AnyObject>;

    save(modeluri: string): Promise<boolean>;

    saveAll(): Promise<boolean>;

    validate(modeluri: string): Promise<Diagnostic>;

    getValidationConstraints(modeluri: string): Promise<string>;

    getTypeSchema(modeluri: string): Promise<string>;

    getUiSchema(schemaname: string): Promise<string>;

    configureServer(configuration: ServerConfiguration): Promise<boolean>;

    ping(): Promise<boolean>;

    edit(modeluri: string, command: ModelServerCommand, format?: string): Promise<boolean>;

    undo(modeluri: string): Promise<string>;

    redo(modeluri: string): Promise<string>;

    // WebSocket connection
    subscribe(modeluri: string, options?: SubscriptionOptions): void;

    send(modelUri: string, message: ModelServerMessage): void;
    unsubscribe(modelUri: string): void;
}

export namespace ModelServerClientApiV1 {
    export const API_ENDPOINT = '/api/v1';
}

/**
 * Options object that can be used to define options for the client on subscribing to the Model Server.
 * The options are optional and can configure the subscription format, timeout,
 * whether liveValidation should be enabled and errorWhenUnsuccessful.
 */
export interface SubscriptionOptions {
    format?: string;
    listener?: SubscriptionListener;
    timeout?: number;
    livevalidation?: boolean;
    errorWhenUnsuccessful?: boolean;
}

/**
 * Configuration object that can be send by the client to configure
 * the workspaceRoot & the ui schema folder.
 */
export interface ServerConfiguration {
    workspaceRoot: string;
    uiSchemaFolder?: string;
}

/**
 * A `ModelServerError` that is thrown clients implementing {@link ModelServerClientApiV1} if a request to the
 * model server has failed. If the server responden with an error code and a valid {@link ModelServerMessage} the
 * error message is derived from the {@link ModelServerMessage.data} property. If no valid message was received i.e. the
 * request failed due to another internal error, the error message of the internal error is reused.
 */
export class ModelServerError extends Error {
    /** the error code */
    readonly code?: string;
    constructor(response: ModelServerMessage | string, code?: string) {
        super(typeof response === 'string' ? response : MessageDataMapper.asString(response));
        this.code = code;
    }
}
