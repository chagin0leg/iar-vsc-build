/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as vscode from "vscode";
import { CppToolsApi, Version } from "vscode-cpptools";
import { getCppToolsApi } from "vscode-cpptools";

const CPPTOOLS_EXTENSION_IDS = [
    "ms-vscode.cpptools",
    "anysphere.cpptools",
];

interface CppToolsExtensionLike {
    getApi(version: Version): CppToolsApi;
}

function isCppToolsExtensionLike(extension: unknown): extension is CppToolsExtensionLike {
    return !!extension && typeof (extension as CppToolsExtensionLike).getApi === "function";
}

function isLegacyCppToolsApi(api: unknown): api is CppToolsApi {
    return !!api
        && typeof (api as CppToolsApi).registerCustomConfigurationProvider === "function"
        && typeof (api as CppToolsApi).didChangeCustomConfiguration === "function";
}

function tryGetApiFromExtension(extension: CppToolsApi | CppToolsExtensionLike, version: Version): CppToolsApi | undefined {
    if (isCppToolsExtensionLike(extension)) {
        try {
            return extension.getApi(version);
        } catch (err) {
            const e = err as RangeError;
            if (e?.message?.startsWith("Invalid version")) {
                return extension.getApi(Version.v1);
            }
        }
    } else if (isLegacyCppToolsApi(extension)) {
        return extension;
    }
    return undefined;
}

/**
 * Gets the CppTools API, checking both ms-vscode.cpptools and anysphere.cpptools.
 * This allows the extension to work in both VS Code and Cursor IDE.
 */
export async function getCompatibleCppToolsApi(version: Version): Promise<CppToolsApi | undefined> {
    const api = await getCppToolsApi(version);
    if (api) {
        return api;
    }

    for (const extensionId of CPPTOOLS_EXTENSION_IDS) {
        const ext: vscode.Extension<unknown> | undefined = vscode.extensions.getExtension(extensionId);
        if (!ext) {
            continue;
        }
        let exports: unknown;
        try {
            exports = ext.isActive ? ext.exports : await ext.activate();
        } catch {
            continue;
        }
        const result = tryGetApiFromExtension(exports as CppToolsApi | CppToolsExtensionLike, version);
        if (result) {
            return result;
        }
    }

    return undefined;
}
