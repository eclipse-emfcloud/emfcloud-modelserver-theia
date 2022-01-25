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
/**
 * Utility collection of all the available endpoint paths of a (default) modelserver.
 */
export namespace ModelServerPaths {

    /** Endpoint to retrieve the uris of all available models in the workspace */
    export const MODEL_URIS = 'modeluris';
    /** Endpoint for executing CRUD model operations or retrieving all available models in the workspace */
    export const MODEL_CRUD = 'models';
    /** Endpoint to retrieve a model element by its id */
    export const MODEL_ELEMENT = 'modelelement';

    /** Endpoint to retrieve the type schema of a model as JSON schema */
    export const TYPE_SCHEMA = 'typeschema';
    /** Endpoint to retrieve the UI schema  of a model as JSON schema */
    export const UI_SCHEMA = 'uischema';

    /** Endpoint to configure the modelserver */
    export const SERVER_CONFIGURE = 'server/configure';
    /** Endpoint to ping the modelserver */
    export const SERVER_PING = 'server/ping';

    /** Endpoint to subscribe/unsubscribe for model state notifications. Has to be called with a Websocket-protocol */
    export const SUBSCRIPTION = 'subscribe';

    /** Endpoint to edit a model using a command */
    export const EDIT = 'edit';

    /** Endpoint to close a model. This unloads the model form the workspace and omits discards any dirty changes */
    export const CLOSE = 'close';
    /** Endpoint to save a model */
    export const SAVE = 'save';
    /** Endpoint to save all currently loaded models */
    export const SAVE_ALL = 'saveall';

    /** Endpoint to undo the last edit command on model */
    export const UNDO = 'undo';
    /** Endpoint to redo the last edit command on model */
    export const REDO = 'redo';

    /** Endpoint to trigger validation for a model */
    export const VALIDATION = 'validation';
    /** Endpoint to get a list of validation constraints of a model */
    export const VALIDATION_CONSTRAINTS = 'validation/constraints';

}
