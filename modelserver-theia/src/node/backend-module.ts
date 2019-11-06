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
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { BackendApplicationContribution } from "@theia/core/lib/node";
import { ContainerModule } from "inversify";

import {
  MODEL_SERVER_CLIENT_SERVICE_PATH,
  ModelServerClient,
  ModelServerFrontendClient
} from "../common/model-server-client";
import { DefaultModelServerLauncher, ModelServerLauncher } from "./model-server-backend-contribution";
import { DefaultModelServerClient } from "./modelserver-api";

export default new ContainerModule(bind => {
  bind(DefaultModelServerLauncher)
    .toSelf()
    .inSingletonScope();
  bind(ModelServerLauncher).toService(DefaultModelServerLauncher);

  bind(ModelServerClient)
    .to(DefaultModelServerClient)
    .inSingletonScope();

  bind(BackendApplicationContribution).toService(DefaultModelServerLauncher);

  bind(ConnectionHandler)
    .toDynamicValue(
      ctx =>
        new JsonRpcConnectionHandler<ModelServerFrontendClient>(
          MODEL_SERVER_CLIENT_SERVICE_PATH,
          client => {
            const server = ctx.container.get<ModelServerClient>(
              ModelServerClient
            );
            server.setClient(client);
            client.onDidCloseConnection(() => server.dispose());
            return server;
          }
        )
    )
    .inSingletonScope();
});
