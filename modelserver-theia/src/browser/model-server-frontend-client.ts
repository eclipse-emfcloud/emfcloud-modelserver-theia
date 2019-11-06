/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { Emitter, Event } from "@theia/core";
import { injectable } from "inversify";

import { ModelServerFrontendClient, ModelServerMessage } from "../common/model-server-client";
import { ModelServerSubscriptionService } from "./model-server-subscription-service";

@injectable()
export class ModelServerFrontendClientImpl
  implements ModelServerFrontendClient, ModelServerSubscriptionService {
  onOpen(): void {
    this.onOpenEmitter.fire();
  }

  onMessage(message: ModelServerMessage): void {
    switch (message.type) {
      case "dirtyState": {
        this.onDirtyStateEmitter.fire(message.data);
        break;
      }
      case "fullUpdate": {
        this.onFullUpdateEmitter.fire(message.data);
        break;
      }
      case "incrementalUpdate": {
        this.onIncrementalUpdateEmitter.fire(message.data);
        break;
      }
      case "success": {
        this.onSuccessEmitter.fire(message.data);
        break;
      }
      case "error": {
        this.onErrorEmitter.fire(message.data);
        break;
      }
      default: {
        this.onUnknownMessageEmitter.fire(JSON.stringify(message));
      }
    }
  }

  onClosed(code: number, reason: string): void {
    this.onClosedEmitter.fire(reason);
  }

  onError(error: Error): void {
    this.onErrorEmitter.fire(error);
  }

  protected onOpenEmitter = new Emitter<Readonly<void>>();
  get onOpenListener(): Event<void> {
    return this.onOpenEmitter.event;
  }

  protected onClosedEmitter = new Emitter<Readonly<string>>();
  get onClosedListener(): Event<string> {
    return this.onClosedEmitter.event;
  }

  protected onErrorEmitter = new Emitter<Readonly<Error>>();
  get onErrorListener(): Event<Error> {
    return this.onErrorEmitter.event;
  }

  protected onDirtyStateEmitter = new Emitter<Readonly<boolean>>();
  get onDirtyStateListener(): Event<boolean> {
    return this.onDirtyStateEmitter.event;
  }

  protected onIncrementalUpdateEmitter = new Emitter<Readonly<Object>>();
  get onIncrementalUpdateListener(): Event<Object> {
    return this.onIncrementalUpdateEmitter.event;
  }

  protected onFullUpdateEmitter = new Emitter<Readonly<Object>>();
  get onFullUpdateListener(): Event<Object> {
    return this.onFullUpdateEmitter.event;
  }

  protected onSuccessEmitter = new Emitter<Readonly<string>>();
  get onSuccessListener(): Event<string> {
    return this.onSuccessEmitter.event;
  }

  protected onUnknownMessageEmitter = new Emitter<Readonly<string>>();
  get onUnknownMessageListener(): Event<string> {
    return this.onUnknownMessageEmitter.event;
  }
}
