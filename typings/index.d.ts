/// <reference path="globals/es6-shim/index.d.ts" />
/// <reference path="globals/jasmine/index.d.ts" />
/// <reference path="globals/jquery/index.d.ts" />
/// <reference path="globals/node/index.d.ts" />
/// <reference path="modules/lodash/index.d.ts" />

interface String {
    format(...replacements: string[]): string;
}
