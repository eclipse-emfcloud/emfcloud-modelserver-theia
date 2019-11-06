/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
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
