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
import { AnyObject, ModelServerCommand } from '@eclipse-emfcloud/modelserver-client';
import { TheiaModelServerClientV2 } from '@eclipse-emfcloud/modelserver-theia';

export const DevModelServerClient = Symbol('DevModelServerClient');
export interface DevModelServerClient extends TheiaModelServerClientV2 {
    counter(operation: 'add' | 'subtract' | undefined, delta: number | undefined): Promise<AnyObject>;
}

export class UpdateTaskNameCommand extends ModelServerCommand {
    constructor(text: string) {
        super('updateTaskName', { text });
    }
}
