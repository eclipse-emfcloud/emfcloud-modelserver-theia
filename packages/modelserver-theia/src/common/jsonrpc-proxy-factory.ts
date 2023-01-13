/********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/

import { AnyObject, asURI, isURI } from '@eclipse-emfcloud/modelserver-client/lib/utils/type-util';
import { JsonRpcProxyFactory } from '@theia/core/lib/common/messaging/proxy-factory';
import URI from 'urijs';

export class TheiaModelServerJsonRpcProxyFactory<T extends object> extends JsonRpcProxyFactory<T> {
    protected override async onRequest(method: string, ...args: any[]): Promise<any> {
        return super.onRequest(method, ...this.processArguments(args));
    }

    protected override onNotification(method: string, ...args: any[]): void {
        super.onNotification(method, ...this.processArguments(args));
    }

    protected processArguments(args: any[]): any[] {
        const processedArgs: any[] = [];
        for (const arg of args) {
            // process arguments and restore URI objects properly for JSON-rpc communication
            if (isURI(arg)) {
                processedArgs.push(new URI(asURI(arg)));
            } else if (Array.isArray(arg)) {
                const argArray = [];
                for (const argument of arg) {
                    if (isURI(argument)) {
                        argArray.push(new URI(asURI(argument)));
                    } else {
                        argArray.push(argument);
                    }
                }
                processedArgs.push(argArray);
            } else if (AnyObject.is(arg)) {
                const argObject: AnyObject = {};
                for (const [key, value] of Object.entries(arg)) {
                    if (isURI(value)) {
                        argObject[key] = new URI(asURI(value));
                    } else {
                        argObject[key] = value;
                    }
                }
                processedArgs.push(argObject);
            } else {
                processedArgs.push(arg);
            }
        }
        return processedArgs;
    }
}
