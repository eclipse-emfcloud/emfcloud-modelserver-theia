/********************************************************************************
 * Copyright (c) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import download from 'mvn-artifact-download';
import { join, resolve } from 'path';
import { existsSync, mkdir } from 'fs';

const downloadDir = resolve(join(__dirname, '..', 'build'));
const mavenRepository = 'https://oss.sonatype.org/content/repositories/snapshots/';
const groupId = 'org.eclipse.emfcloud.modelserver';
const artifactId = 'org.eclipse.emfcloud.modelserver.example';
const version = '0.7.0';
const classifier = 'standalone';

// Check if target directory exists, create otherwise
if (existsSync(downloadDir)) {
    console.log('Target directory exists.');
} else {
    console.log('Creating target directory...');
    mkdir(downloadDir, err => {
        if (err) {
            return console.error(err);
        }
        console.log('Target directory was created successfully!');
    });
}
// Download Model Server standalone jar (current SNAPSHOt version)
console.log('Downloading latest version of the Example Model Server JAR from the maven repository...');
download({ groupId, artifactId, version, classifier, isSnapShot: true }, downloadDir, mavenRepository).then(() =>
    console.log(
        'Download completed. Start the Theia backend using the following command: \n\n  yarn start\n\n' +
            'After starting the Theia backend, access the following link locally in your browser to see the running example:\n' +
            'http://localhost:3000'
    )
);
