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

export namespace ModelServerPaths {
  export const INDEX = 'index';
  export const MODEL_URIS = 'modeluris';
  export const MODEL_CRUD = 'models';

  export const SCHEMA = 'schema';

  export const SERVER_CONFIGURE = 'server/configure';
  export const SERVER_PING = 'server/ping';

  export const SUBSCRIPTION = 'subscribe'; // accepts query parameter "modeluri"

  export const COMMANDS = 'edit';

  export const SAVE = 'save';
}
