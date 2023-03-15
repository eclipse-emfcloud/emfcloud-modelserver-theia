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
import { timeout } from '@theia/core/lib/common/promise-util';
import { inject, injectable } from '@theia/core/shared/inversify';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import URI from 'urijs';

import { TheiaModelServerClientV2 } from '../common';

@injectable()
export class ModelServerFrontendContribution implements FrontendApplicationContribution {
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;
    @inject(TheiaModelServerClientV2) protected readonly modelServerClient: TheiaModelServerClientV2;

    configure(_app: FrontendApplication): MaybePromise<void> {
        return this.setup();
    }

    async setup(): Promise<void> {
        this.workspaceService.onWorkspaceChanged(async workspace => {
            if (workspace[0] && workspace[0].resource) {
                const workspaceRoot = new URI(workspace[0].resource.toString());
                const uiSchemaFolder = workspaceRoot.clone().segment('.ui-schemas');
                const serverLoaded = await this.waitForReady();
                if (serverLoaded) {
                    console.log('Model Server ready');
                    await this.modelServerClient.configureServer({ workspaceRoot, uiSchemaFolder });
                } else {
                    console.error('Model Server failed to load');
                }
            }
        });
    }

    async waitForReady(ms = 1000, numberOfTries = 20): Promise<boolean> {
        let available = false;
        while (!available && numberOfTries > 0) {
            await this.modelServerClient
                .ping()
                .then(async value => {
                    if (value) {
                        available = true;
                    } else {
                        await timeout(ms);
                    }
                })
                .catch(async e => {
                    console.log('Model Server not ready yet: ' + e);
                    await timeout(ms);
                });
            numberOfTries--;
        }
        return available;
    }
}
