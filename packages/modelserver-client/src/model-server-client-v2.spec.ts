/*********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
import { strictEqual } from 'assert';
import { expect } from 'chai';
import { Operation } from 'fast-json-patch';
import moxios from 'moxios';
import { spy } from 'sinon';

import { ServerConfiguration } from './model-server-client-api-v1';
import { ModelServerClientApiV2 } from './model-server-client-api-v2';
import { ModelServerClientV2 } from './model-server-client-v2';
import { Model, ModelServerMessage } from './model-server-message';
import { ModelServerPaths } from './model-server-paths';

describe('tests for ModelServerClientV2', () => {
    let client: ModelServerClientV2;
    const baseUrl = `http://localhost:8081${ModelServerClientApiV2.API_ENDPOINT}`;

    beforeEach(() => {
        client = new ModelServerClientV2();
        client.initialize(baseUrl);
        moxios.install(client['restClient']);
    });

    afterEach(() => {
        moxios.uninstall(client['restClient']);
    });

    it('initialize - correct baseUrl config of axios instance', () => {
        const axios = client['restClient'];
        expect(axios.defaults.baseURL).to.be.equal(baseUrl);
    });

    describe('test requests', () => {
        it('getAll', done => {
            client.getAll();
            client.getAll('xml');
            client.getAll();
            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ format: 'json' });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml' });
                done();
            });
        });

        it('getModelUris', done => {
            client.getModelUris();
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.undefined;
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_URIS);
                done();
            });
        });

        it('getElementById', done => {
            const modeluri = 'my/uri.model';
            const elementid = 'myElement';

            client.getElementById(modeluri, elementid);
            client.getElementById(modeluri, elementid, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ format: 'json', elementid, modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_ELEMENT);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', elementid, modeluri });
                done();
            });
        });

        it('getElementByName', done => {
            const modeluri = 'my/uri.model';
            const elementname = 'myElement';

            client.getElementByName(modeluri, elementname);
            client.getElementByName(modeluri, elementname, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ format: 'json', elementname, modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_ELEMENT);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', elementname, modeluri });
                done();
            });
        });

        it('delete', done => {
            const modeluri = 'delete/me/please';
            client.delete(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('delete');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                done();
            });
        });

        it('close', done => {
            const modeluri = 'delete/me/please';
            client.close(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('post');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.CLOSE);
                done();
            });
        });

        it('create', done => {
            const modeluri = 'delete/me/please';
            const model = { name: 'myModel', id: 'myModelId' };
            const data = JSON.stringify(model);
            client.create(modeluri, data);
            client.create(modeluri, data, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('post');
                expect(request.config.data).to.be.equal(JSON.stringify({ data }));
                expect(request.config.params).to.include({ format: 'json', modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', modeluri });
                done();
            });
        });

        it('update', done => {
            const modeluri = 'delete/me/please';
            const model = { name: 'myModel', id: 'myModelId' };
            const data = JSON.stringify(model);
            client.update(modeluri, data);
            client.update(modeluri, data, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('put');
                expect(request.config.data).to.be.equal(JSON.stringify({ data }));
                expect(request.config.params).to.include({ format: 'json', modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', modeluri });
                done();
            });
        });

        it('save', done => {
            const modeluri = 'save/me/please';
            client.save(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.SAVE);
                done();
            });
        });

        it('save', done => {
            client.saveAll();
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.undefined;
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.SAVE_ALL);
                done();
            });
        });

        it('validate', done => {
            const modeluri = 'validate/me/please';
            client.validate(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.VALIDATION);
                done();
            });
        });

        it('getValidationConstraints', done => {
            const modeluri = 'validate/me/please';
            client.getValidationConstraints(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.VALIDATION_CONSTRAINTS);
                done();
            });
        });

        it('getTypeSchema', done => {
            const modeluri = 'my/model/uri';
            client.getTypeSchema(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.TYPE_SCHEMA);
                done();
            });
        });

        it('getUiSchema', done => {
            const schemaname = 'myschema';
            client.getUiSchema(schemaname);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ schemaname });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.UI_SCHEMA);
                done();
            });
        });

        it('configureServer', done => {
            const configuration: ServerConfiguration = {
                workspaceRoot: 'myRoot',
                uiSchemaFolder: 'mySchemaFolder'
            };
            client.configureServer(configuration);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('put');
                expect(request.config.data).to.equal(JSON.stringify(configuration));
                expect(request.config.params).to.be.undefined;
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.SERVER_CONFIGURE);
                done();
            });
        });

        it('ping', done => {
            client.ping();
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.undefined;
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.SERVER_PING);
                done();
            });
        });

        it('edit', done => {
            const modeluri = 'edit/me/please';
            const patch: Operation[] = [
                {
                    op: 'replace',
                    path: 'SuperBrewer3000.coffee#//@workflows.0/name',
                    value: 'Auto Brew Workflow'
                }
            ];
            const expected = {
                type: 'modelserver.patch',
                data: patch
            };
            client.edit(modeluri, patch);

            moxios.wait(() => {
                const request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('patch');
                expect(request.config.data).to.be.equal(JSON.stringify({ data: expected }));
                expect(request.config.params).to.include({ format: 'json', modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                done();
            });
        });

        it('undo', done => {
            const modeluri = 'undo/me/please';
            client.undo(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.UNDO);
                done();
            });
        });

        it('redo', done => {
            const modeluri = 'redo/me/please';
            client.redo(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl);
                expect(request.config.url).to.be.equal(ModelServerPaths.REDO);
                done();
            });
        });
    });

    describe('test responses', () => {
        it('ping ', done => {
            const expectedMsg: ModelServerMessage = {
                data: '',
                type: 'success'
            };
            const onFulfilled = spy();
            client.ping().then(onFulfilled);
            moxios.wait(async () => {
                const request = moxios.requests.mostRecent();
                await request.respondWith({
                    status: 200,
                    response: expectedMsg
                });
                strictEqual(onFulfilled.getCall(0).args[0], true);
                done();
            });
        });

        it('ping ', done => {
            const model1: Model = {
                modelUri: 'path/to/model1',
                content: {
                    name: 'coffee'
                }
            };
            const model2: Model = {
                modelUri: 'path/to/model2',
                content: {
                    name: 'coffee'
                }
            };
            const response: ModelServerMessage = {
                data: {
                    [model1.modelUri]: model1.content,
                    [model2.modelUri]: model2.content
                },
                type: 'success'
            };
            const onFulfilled = spy();
            client.getAll().then(onFulfilled);
            moxios.wait(async () => {
                const request = moxios.requests.mostRecent();
                await request.respondWith({
                    status: 200,
                    response
                });
                const result = onFulfilled.getCall(0).args[0];
                expect(result).to.deep.include.members([model2, model1]);
                done();
            });
        });
    });
});
