/********************************************************************************
 * Copyright (c) 2020-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import { TheiaModelServerClient } from '@eclipse-emfcloud/modelserver-theia';
import { ContainerModule } from '@theia/core/shared/inversify';

import { CustomDevModelServerClient } from './model-server-client';

export default new ContainerModule((_bind, _unbind, _isBound, rebind) => {
    rebind(TheiaModelServerClient).to(CustomDevModelServerClient).inSingletonScope();
});
