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
import { MaybePromise } from '@theia/core';
import { FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable } from 'inversify';

import { ModelServerClient } from '../common';

@injectable()
export class ModelServerFrontendContribution implements FrontendApplicationContribution {
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;
    @inject(ModelServerClient) protected readonly modelServerClient: ModelServerClient;

    configure(app: FrontendApplication): MaybePromise<void> {
        return this.setup();
    }

    async setup(): Promise<void> {
        this.workspaceService.onWorkspaceChanged(workspace => {
            if (workspace[0] && workspace[0].resource) {
                const workspaceRoot = workspace[0].resource.toString();
                const uiSchemaFolder = workspaceRoot + '/.ui-schemas';
                this.modelServerClient.configure({ workspaceRoot, uiSchemaFolder });
            }
        });
    }
}
