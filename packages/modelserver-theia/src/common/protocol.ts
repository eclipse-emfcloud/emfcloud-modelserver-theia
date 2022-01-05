/********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { SubscriptionListener } from '@eclipse-emfcloud/modelserver-client';

export const MODEL_SERVER_CLIENT_SERVICE_PATH = '/services/modelserverclient';

export const ModelServerFrontendClient = Symbol('ModelServerFrontendClient');
export type ModelServerFrontendSubscriptionListener = SubscriptionListener;

