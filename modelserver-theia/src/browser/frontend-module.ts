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
import { FrontendApplicationContribution, WebSocketConnectionProvider } from "@theia/core/lib/browser";
import { ContainerModule } from "inversify";

import {
  MODEL_SERVER_CLIENT_SERVICE_PATH,
  ModelServerClient,
  ModelServerFrontendClient
} from "../common/model-server-client";
import { ModelServerFrontendClientImpl } from "./model-server-frontend-client";
import { ModelServerFrontendContribution } from "./model-server-frontend-contribution";
import { ModelServerSubscriptionService } from "./model-server-subscription-service";

export default new ContainerModule(bind => {
  bind(ModelServerFrontendContribution)
    .toSelf()
    .inSingletonScope();
  bind(FrontendApplicationContribution).toService(
    ModelServerFrontendContribution
  );
  bind(ModelServerFrontendClientImpl)
    .toSelf()
    .inSingletonScope();
  bind(ModelServerFrontendClient).toService(ModelServerFrontendClientImpl);
  bind(ModelServerSubscriptionService).toService(ModelServerFrontendClientImpl);
  bind(ModelServerClient)
    .toDynamicValue(ctx => {
      const connection = ctx.container.get(WebSocketConnectionProvider);
      const client: ModelServerFrontendClient = ctx.container.get(
        ModelServerFrontendClient
      );
      return connection.createProxy<ModelServerClient>(
        MODEL_SERVER_CLIENT_SERVICE_PATH,
        client
      );
    })
    .inSingletonScope();
});
