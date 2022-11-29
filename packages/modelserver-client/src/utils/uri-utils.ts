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
import { URI as TheiaURI } from '@theia/core/lib/common/uri';
import URI from 'urijs';

/**
 * Converts the given TheiaURI to an URI object
 * @param theiaUri the Theia uri to be converted
 * @returns the converted URI
 */
export function convertToUri(theiaUri: TheiaURI): URI {
    return new URI(theiaUri.toString(true)).normalize();
}

/**
 * Converts the given URI to a TheiaURI object
 * @param uri the uri to be converted
 * @returns the converted TheiaURI
 */
export function convertToTheiaUri(uri: URI): TheiaURI {
    return new TheiaURI(uri.toString());
}
