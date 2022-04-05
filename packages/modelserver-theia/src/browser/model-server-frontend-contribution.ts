/********************************************************************************
 * Copyright (c) 2019-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import { MaybePromise } from '@theia/core';
import { FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { WorkspaceService } from '@theia/workspace/lib/browser';

import { TheiaModelServerClient } from '../common';

@injectable()
export class ModelServerFrontendContribution implements FrontendApplicationContribution {
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;
    @inject(TheiaModelServerClient) protected readonly modelServerClient: TheiaModelServerClient;

    configure(app: FrontendApplication): MaybePromise<void> {
        return this.setup();
    }

    async setup(): Promise<void> {
        this.workspaceService.onWorkspaceChanged(workspace => {
            if (workspace[0] && workspace[0].resource) {
                const workspaceRoot = workspace[0].resource.toString();
                const uiSchemaFolder = workspaceRoot + '/.ui-schemas';
                this.modelServerClient.configureServer({ workspaceRoot, uiSchemaFolder });
            }
        });
    }
}
