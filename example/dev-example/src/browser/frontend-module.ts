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
import { ModelServerClient } from '@eclipse-emfcloud/modelserver-theia';
import { CommandContribution, MenuContribution } from '@theia/core';
import { ContainerModule } from 'inversify';

import { DevModelServerClient } from '../common/dev-model-server-client';
import { ApiTestMenuContribution } from './api-test-menu';

export default new ContainerModule(bind => {
    bind(ApiTestMenuContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(ApiTestMenuContribution);
    bind(MenuContribution).toService(ApiTestMenuContribution);
    bind(DevModelServerClient).toService(ModelServerClient);
});
