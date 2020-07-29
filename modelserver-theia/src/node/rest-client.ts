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
import { Response } from '../common/model-server-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');

/**
 * A simple helper class for performing REST requests
 */
export class RestClient {
    constructor(protected baseUrl: string) { }

    private async performRequest<T>(
        verb: string,
        path: string,
        body?: string
    ): Promise<Response<T>> {
        const response = await fetch(this.baseUrl + path, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: verb,
            body
        });
        const json = (await response.json()) as T;
        return new Response(json, response.status, response.statusText);
    }

    async get<T>(
        path: string,
        parameters?: Map<string, string>
    ): Promise<Response<T>> {
        let getUrl = path;
        if (parameters) {
            const urlParameters = this.encodeURLParameters(parameters);
            getUrl = getUrl.concat(urlParameters);
        }
        return this.performRequest<T>('get', getUrl);
    }

    async post<T>(url: string, body?: string): Promise<Response<T>> {
        return this.performRequest<T>('post', url, body);
    }

    async put<T>(url: string, body?: string): Promise<Response<T>> {
        return this.performRequest<T>('PUT', url, body);
    }

    async patch<T>(url: string, body?: string): Promise<Response<T>> {
        return this.performRequest<T>('patch', url, body);
    }

    async remove<T>(
        url: string,
        parameters?: Map<string, string>
    ): Promise<Response<T>> {
        let deleteUrl = url;
        if (parameters) {
            const urlParameters = this.encodeURLParameters(parameters);
            deleteUrl = deleteUrl.concat(urlParameters);
        }
        return this.performRequest<T>('delete', deleteUrl);
    }

    private encodeURLParameters(parameters: Map<string, string>): string {
        if (parameters.size) {
            const urlParameters = '?';
            const parametersArray: string[] = [];
            parameters.forEach((value, key) => {
                parametersArray.push(
                    encodeURIComponent(key) + '=' + encodeURIComponent(value)
                );
            });
            return urlParameters.concat(parametersArray.join('&'));
        }
        return '';
    }
}
