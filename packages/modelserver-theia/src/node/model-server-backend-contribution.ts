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
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { inject, injectable, optional } from '@theia/core/shared/inversify';
import { ProcessErrorEvent } from '@theia/process/lib/node/process';
import { ProcessManager } from '@theia/process/lib/node/process-manager';
import { RawProcess, RawProcessFactory } from '@theia/process/lib/node/raw-process';
import * as cp from 'child_process';

import { TheiaModelServerClient, TheiaModelServerClientV2 } from '../common';
import { DEFAULT_LAUNCH_OPTIONS, DEFAULT_MODELSERVER_NODE_LAUNCH_OPTIONS, LaunchOptions } from './launch-options';

export const ModelServerLauncher = Symbol('ModelServerLauncher');

export interface ModelServerLauncher {
    startServer(): boolean;
    dispose(): void;
}

@injectable()
export class DefaultModelServerLauncher implements ModelServerLauncher, BackendApplicationContribution {
    @inject(LaunchOptions) @optional() protected readonly launchOptions: LaunchOptions = DEFAULT_LAUNCH_OPTIONS;
    @inject(RawProcessFactory) protected readonly processFactory: RawProcessFactory;
    @inject(ProcessManager) protected readonly processManager: ProcessManager;
    @inject(TheiaModelServerClient) protected readonly modelserverClient: TheiaModelServerClient | TheiaModelServerClientV2;

    async initialize(): Promise<void> {
        try {
            const alive = await this.modelserverClient.ping();
            if (alive) {
                this.logError('Model Server is already running!');
            } else {
                throw new Error('Could not reach Model Server');
            }
        } catch (error) {
            this.logInfo('Starting Model Server');
            this.startServer();
        }
    }

    startServer(): boolean {
        if (this.validateLaunch()) {
            this.doStartServer();
        }
        return true;
    }

    protected doStartServer(): void {
        // Note that the existence of the jarPath was previously checked
        let args = ['-jar', this.launchOptions.jarPath!, '--port', `${this.launchOptions.serverPort}`];
        if (this.launchOptions.additionalArgs) {
            args = [...args, ...this.launchOptions.additionalArgs];
        }
        this.spawnProcessAsync('java', args);
    }

    protected validateLaunch(): boolean {
        if (!this.launchOptions.jarPath) {
            this.logError('Could not start model server. No path to executable is specified');
            return false;
        }
        return true;
    }

    protected spawnProcessAsync(command: string, args?: string[], options?: cp.SpawnOptions): Promise<RawProcess> {
        const rawProcess = this.processFactory({ command, args, options });
        rawProcess.errorStream.on('data', this.logError.bind(this));
        rawProcess.outputStream.on('data', this.logInfo.bind(this));
        return new Promise<RawProcess>((resolve, reject) => {
            rawProcess.onError((error: ProcessErrorEvent) => {
                this.onDidFailSpawnProcess(error);
                if (error.code === 'ENOENT') {
                    const guess = command.split(/\s+/).shift();
                    if (guess) {
                        reject(new Error(`Failed to spawn ${guess}.\nPerhaps it is not on the PATH.`));
                        return;
                    }
                }
                reject(error);
            });
            process.nextTick(() => resolve(rawProcess));
        });
    }

    protected onDidFailSpawnProcess(error: Error | ProcessErrorEvent): void {
        this.logError(error.message);
    }

    protected logError(data: string | Buffer): void {
        if (data) {
            console.error(`ModelServerBackendContribution: ${data.toString().trimEnd()}`);
        }
    }

    protected logInfo(data: string | Buffer): void {
        if (data) {
            console.info(`ModelServerBackendContribution: ${data.toString().trimEnd()}`);
        }
    }

    dispose(): void {
        // nothing to do
    }

    onStop(): void {
        this.dispose();
    }
}

@injectable()
export class DefaultModelServerNodeLauncher extends DefaultModelServerLauncher {
    @inject(LaunchOptions) @optional() protected readonly launchOptions: LaunchOptions = DEFAULT_MODELSERVER_NODE_LAUNCH_OPTIONS;
    @inject(TheiaModelServerClientV2) protected readonly modelserverClient: TheiaModelServerClientV2;

    validateLaunch(): boolean {
        let result = super.validateLaunch();

        if (!this.launchOptions.modelServerNode?.jsPath) {
            this.logError('Could not start model server (Node). No path to main script is specified');
            result = false;
        }

        return result;
    }

    protected doStartServer(): void {
        // Launch the Java server
        super.doStartServer();

        // Then launch the Node server

        // Note that validation previously asserted the existence of the `modelServerNode` property
        const upstreamPort =
            this.launchOptions.modelServerNode!.upstreamPort ?? DEFAULT_MODELSERVER_NODE_LAUNCH_OPTIONS.modelServerNode.upstreamPort;
        const port = this.launchOptions.serverPort;

        // Note that the existence of the jsPath was previously checked
        let args = [this.launchOptions.modelServerNode!.jsPath!, '--port', `${port}`, '--upstream', `${upstreamPort}`];
        if (this.launchOptions.modelServerNode?.additionalArgs) {
            args = [...args, ...this.launchOptions.modelServerNode.additionalArgs];
        }
        this.spawnProcessAsync('node', args);
    }
}
