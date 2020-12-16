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
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { ProcessErrorEvent } from '@theia/process/lib/node/process';
import { ProcessManager } from '@theia/process/lib/node/process-manager';
import { RawProcess, RawProcessFactory } from '@theia/process/lib/node/raw-process';
import * as cp from 'child_process';
import { inject, injectable, optional } from 'inversify';

import { DEFAULT_LAUNCH_OPTIONS, LaunchOptions, ModelServerClient } from '../common';

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
    @inject(ModelServerClient) protected readonly modelserverClient: ModelServerClient;

    initialize(): void {
        this.modelserverClient.initialize().then(initialized => {
            if (initialized) {
                this.modelserverClient.ping().then(alive => {
                    if (!alive) {
                        this.logError('Error during model server startup');
                    } else {
                        this.logInfo('Modelserver is already running');
                    }
                }).catch(() => {
                    this.logInfo('Starting modelserver from jar');
                    this.startServer();

                });
            }
        });
    }

    startServer(): boolean {
        if (this.launchOptions.jarPath) {
            let args = ['-jar', this.launchOptions.jarPath, '--port', `${this.launchOptions.serverPort}`];
            if (this.launchOptions.additionalArgs) {
                args = [...args, ...this.launchOptions.additionalArgs];
            }
            this.spawnProcessAsync('java', args);
        } else {
            this.logError('Could not start model server. No path to executable is specified');
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
                        reject(new Error(`Failed to spawn ${guess}\nPerhaps it is not on the PATH.`));
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
            console.error(`ModelServerBackendContribution: ${data}`);
        }
    }

    protected logInfo(data: string | Buffer): void {
        if (data) {
            console.info(`ModelServerBackendContribution: ${data}`);
        }
    }

    dispose(): void {
        // nothing to do
    }

    onStop(): void {
        this.dispose();
    }

}
