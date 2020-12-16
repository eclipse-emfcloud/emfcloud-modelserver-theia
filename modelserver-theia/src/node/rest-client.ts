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
import { Response } from '../common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');

/**
 * A simple helper class for performing REST requests
 */
export class RestClient<BODY> {
    constructor(protected baseUrl: string) { }

    private async performRequest(
        verb: string,
        path: string,
        body?: string
    ): Promise<Response<BODY>> {
        const response = await fetch(this.baseUrl + path, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: verb,
            body
        });
        const json = (await response.json()) as BODY;
        return new Response(json, response.status, response.statusText);
    }

    async get(
        path: string,
        parameters?: Map<string, string>
    ): Promise<Response<BODY>> {
        let getUrl = path;
        if (parameters) {
            const urlParameters = this.encodeURLParameters(parameters);
            getUrl = getUrl.concat(urlParameters);
        }
        return this.performRequest('get', getUrl);
    }

    async post(url: string, body?: string): Promise<Response<BODY>> {
        return this.performRequest('post', url, body);
    }

    async put(url: string, body?: string): Promise<Response<BODY>> {
        return this.performRequest('PUT', url, body);
    }

    async patch(url: string, body?: string): Promise<Response<BODY>> {
        return this.performRequest('patch', url, body);
    }

    async remove(
        url: string,
        parameters?: Map<string, string>
    ): Promise<Response<BODY>> {
        let deleteUrl = url;
        if (parameters) {
            const urlParameters = this.encodeURLParameters(parameters);
            deleteUrl = deleteUrl.concat(urlParameters);
        }
        return this.performRequest('delete', deleteUrl);
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
