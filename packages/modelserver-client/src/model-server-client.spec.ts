/********************************************************************************
 * Copyright (c) 2021-2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import { strictEqual } from 'assert';
import { expect } from 'chai';
import moxios from 'moxios';
import { spy } from 'sinon';
import URI from 'urijs';

import { ModelServerClient } from './model-server-client';
import { ModelServerClientApiV1, ServerConfiguration } from './model-server-client-api-v1';
import { Model, ModelServerMessage } from './model-server-message';
import { ModelServerPaths } from './model-server-paths';
import { SetCommand } from './model/command-model';

describe('tests for ModelServerClient', () => {
    let client: ModelServerClient;
    const baseUrl = new URI({
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        path: ModelServerClientApiV1.API_ENDPOINT
    });

    beforeEach(() => {
        client = new ModelServerClient();
        client.initialize(baseUrl);
        moxios.install(client['restClient']);
    });

    afterEach(() => {
        moxios.uninstall(client['restClient']);
    });

    it('initialize - correct baseUrl config of axios instance', () => {
        const axios = client['restClient'];
        expect(axios.defaults.baseURL).to.be.equal(baseUrl.toString());
    });
    it('test createSubscriptionPath without trailing slash', () => {
        client = new ModelServerClient();
        client.initialize(baseUrl);
        const subscriptionPath = client['createSubscriptionPath'](new URI('foo'), {});
        expect(subscriptionPath.toString()).to.be.equal('ws://localhost:8081/api/v1/subscribe?modeluri=foo&format=json');
    });
    it('test createSubscriptionPath with trailing slash', () => {
        client = new ModelServerClient();
        client.initialize(new URI(`${baseUrl}/`));
        const subscriptionPath = client['createSubscriptionPath'](new URI('foo'), {});
        expect(subscriptionPath.toString()).to.be.equal('ws://localhost:8081/api/v1/subscribe?modeluri=foo&format=json');
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
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
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
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_URIS);
                done();
            });
        });

        it('getElementById', done => {
            const modeluri = new URI('my/uri.model');
            const elementid = 'myElement';

            client.getElementById(modeluri, elementid);
            client.getElementById(modeluri, elementid, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ format: 'json', elementid, modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_ELEMENT);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', elementid, modeluri });
                done();
            });
        });

        it('getElementByName', done => {
            const modeluri = new URI('my/uri.model');
            const elementname = 'myElement';

            client.getElementByName(modeluri, elementname);
            client.getElementByName(modeluri, elementname, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ format: 'json', elementname, modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_ELEMENT);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', elementname, modeluri });
                done();
            });
        });

        it('delete', done => {
            const modeluri = new URI('delete/me/please');
            client.delete(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('delete');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                done();
            });
        });

        it('close', done => {
            const modeluri = new URI('delete/me/please');
            client.close(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('post');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.CLOSE);
                done();
            });
        });

        it('create', done => {
            const modeluri = new URI('delete/me/please');
            const model = { name: 'myModel', id: 'myModelId' };
            const data = JSON.stringify(model);
            client.create(modeluri, data);
            client.create(modeluri, data, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('post');
                expect(request.config.data).to.be.equal(JSON.stringify({ data }));
                expect(request.config.params).to.include({ format: 'json', modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', modeluri });
                done();
            });
        });

        it('update', done => {
            const modeluri = new URI('delete/me/please');
            const model = { name: 'myModel', id: 'myModelId' };
            const data = JSON.stringify(model);
            client.update(modeluri, data);
            client.update(modeluri, data, 'xml');

            moxios.wait(() => {
                let request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('patch');
                expect(request.config.data).to.be.equal(JSON.stringify({ data }));
                expect(request.config.params).to.include({ format: 'json', modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.MODEL_CRUD);
                request = moxios.requests.at(1);
                expect(request.config.params).to.include({ format: 'xml', modeluri });
                done();
            });
        });

        it('save', done => {
            const modeluri = new URI('save/me/please');
            client.save(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.SAVE);
                done();
            });
        });

        it('saveAll', done => {
            client.saveAll();
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.undefined;
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.SAVE_ALL);
                done();
            });
        });

        it('validate', done => {
            const modeluri = new URI('validate/me/please');
            client.validate(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.VALIDATION);
                done();
            });
        });

        it('getValidationConstraints', done => {
            const modeluri = new URI('validate/me/please');
            client.getValidationConstraints(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.VALIDATION_CONSTRAINTS);
                done();
            });
        });

        it('getTypeSchema', done => {
            const modeluri = new URI('my/model/uri');
            client.getTypeSchema(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
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
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
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
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
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
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.SERVER_PING);
                done();
            });
        });

        it('edit', done => {
            const modeluri = new URI('edit/me/please');
            const command = new SetCommand(
                {
                    eClass: 'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
                    $ref: 'SuperBrewer3000.coffee#//@workflows.0'
                },
                'name',
                ['Auto Brew Workflow']
            );

            client.edit(modeluri, command);

            moxios.wait(() => {
                const request = moxios.requests.at(0);
                expect(request.config.method).to.be.equal('patch');
                expect(request.config.data).to.be.equal(JSON.stringify({ data: command }));
                expect(request.config.params).to.include({ format: 'json', modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.EDIT);
                done();
            });
        });

        it('undo', done => {
            const modeluri = new URI('undo/me/please');
            client.undo(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.UNDO);
                done();
            });
        });

        it('redo', done => {
            const modeluri = new URI('redo/me/please');
            client.redo(modeluri);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                expect(request.config.method).to.be.equal('get');
                expect(request.config.params).to.be.include({ modeluri });
                expect(request.config.baseURL).to.be.equal(baseUrl.toString());
                expect(request.config.url).to.be.equal(ModelServerPaths.REDO);
                done();
            });
        });
    });

    describe('test responses', () => {
        it('ping', done => {
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

        it('getAll ', done => {
            const model1: Model = {
                modeluri: 'file:/path/to/model1',
                content: {
                    name: 'coffee'
                }
            };
            const model2: Model = {
                modeluri: 'file:/path/to/model2',
                content: {
                    name: 'coffee'
                }
            };
            const response: ModelServerMessage = {
                data: {
                    [model1.modeluri]: model1.content,
                    [model2.modeluri]: model2.content
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
                expect(result).to.be.an('array').of.length(2);
                expect(result).to.deep.include.members([model1, model2]);
                done();
            });
        });
    });
});
