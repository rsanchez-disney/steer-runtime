const __import_meta_url = require("url").pathToFileURL(__filename).href;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.4.5",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        "lint-readme": "standard-markdown",
        pretest: "npm run lint && npm run dts-check",
        test: "tap tests/*.js --100 -Rspec",
        "test:coverage": "tap --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@definitelytyped/dtslint": "^0.0.133",
        "@types/node": "^18.11.3",
        decache: "^4.6.1",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-markdown": "^7.1.0",
        "standard-version": "^9.5.0",
        tap: "^16.3.0",
        tar: "^6.1.11",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var crypto = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      const vaultPath = _vaultPath(options);
      const result = DotenvModule.configDotenv({ path: vaultPath });
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _log(message) {
      console.log(`[dotenv@${version}][INFO] ${message}`);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      _log("Loading env from encrypted .env.vault");
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// build/utils/customFields.js
var customFields_exports = {};
__export(customFields_exports, {
  CUSTOM_FIELD_ALIASES: () => CUSTOM_FIELD_ALIASES,
  formatCustomFieldValue: () => formatCustomFieldValue,
  getCustomFieldLabel: () => getCustomFieldLabel,
  resolveCustomFieldIds: () => resolveCustomFieldIds
});
function resolveCustomFieldIds(input) {
  const resolved = [];
  for (const token of input) {
    const lower = token.toLowerCase();
    const aliasMatch = Object.entries(CUSTOM_FIELD_ALIASES).find(([alias]) => alias.toLowerCase() === lower);
    if (aliasMatch) {
      resolved.push(aliasMatch[1]);
      continue;
    }
    if (/^customfield_\d+$/i.test(token)) {
      resolved.push(token);
      continue;
    }
    console.error(`[customFields] Unknown alias or field ID: "${token}" \u2013 skipping`);
  }
  return [...new Set(resolved)];
}
function getCustomFieldLabel(fieldId) {
  const alias = REVERSE_ALIASES[fieldId];
  return alias ? `${alias} (${fieldId})` : fieldId;
}
function formatCustomFieldValue(value) {
  if (value === null || value === void 0)
    return "Not set";
  if (typeof value === "string")
    return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (typeof value === "object" && value !== null) {
    const obj = value;
    if (obj.name)
      return String(obj.name);
    if (obj.value)
      return String(obj.value);
    if (obj.displayName)
      return String(obj.displayName);
    if (Array.isArray(value)) {
      return value.map((v) => formatCustomFieldValue(v)).join(", ");
    }
    return JSON.stringify(value);
  }
  return String(value);
}
var CUSTOM_FIELD_ALIASES, REVERSE_ALIASES;
var init_customFields = __esm({
  "build/utils/customFields.js"() {
    "use strict";
    CUSTOM_FIELD_ALIASES = {
      // ── Team / Org ───────────────────────────────────
      team: "customfield_22600",
      // ── App / Release ────────────────────────────────
      appVersion: "customfield_15301",
      // ── QA / Defect ──────────────────────────────────
      rootCauseAnalysis: "customfield_20805",
      // ── Agile ────────────────────────────────────────
      sprint: "customfield_10003",
      storyPoints: "customfield_10004",
      epicLink: "customfield_13912",
      // ── Studio / Programme ───────────────────────────
      studio: "customfield_20001",
      // ── Test / QA ────────────────────────────────────
      testDetails: "customfield_20104"
      // Add more aliases below as needed:
      // myAlias: "customfield_XXXXX",
    };
    REVERSE_ALIASES = Object.fromEntries(Object.entries(CUSTOM_FIELD_ALIASES).map(([alias, fieldId]) => [
      fieldId,
      alias
    ]));
  }
});

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// node_modules/@modelcontextprotocol/sdk/dist/types.js
var LATEST_PROTOCOL_VERSION = "2024-11-05";
var SUPPORTED_PROTOCOL_VERSIONS = [
  LATEST_PROTOCOL_VERSION,
  "2024-10-07"
];
var JSONRPC_VERSION = "2.0";
var ProgressTokenSchema = external_exports.union([external_exports.string(), external_exports.number().int()]);
var CursorSchema = external_exports.string();
var BaseRequestParamsSchema = external_exports.object({
  _meta: external_exports.optional(external_exports.object({
    /**
     * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
     */
    progressToken: external_exports.optional(ProgressTokenSchema)
  }).passthrough())
}).passthrough();
var RequestSchema = external_exports.object({
  method: external_exports.string(),
  params: external_exports.optional(BaseRequestParamsSchema)
});
var BaseNotificationParamsSchema = external_exports.object({
  /**
   * This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.
   */
  _meta: external_exports.optional(external_exports.object({}).passthrough())
}).passthrough();
var NotificationSchema = external_exports.object({
  method: external_exports.string(),
  params: external_exports.optional(BaseNotificationParamsSchema)
});
var ResultSchema = external_exports.object({
  /**
   * This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.
   */
  _meta: external_exports.optional(external_exports.object({}).passthrough())
}).passthrough();
var RequestIdSchema = external_exports.union([external_exports.string(), external_exports.number().int()]);
var JSONRPCRequestSchema = external_exports.object({
  jsonrpc: external_exports.literal(JSONRPC_VERSION),
  id: RequestIdSchema
}).merge(RequestSchema).strict();
var JSONRPCNotificationSchema = external_exports.object({
  jsonrpc: external_exports.literal(JSONRPC_VERSION)
}).merge(NotificationSchema).strict();
var JSONRPCResponseSchema = external_exports.object({
  jsonrpc: external_exports.literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  result: ResultSchema
}).strict();
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["ConnectionClosed"] = -1] = "ConnectionClosed";
  ErrorCode2[ErrorCode2["RequestTimeout"] = -2] = "RequestTimeout";
  ErrorCode2[ErrorCode2["ParseError"] = -32700] = "ParseError";
  ErrorCode2[ErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
  ErrorCode2[ErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
  ErrorCode2[ErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
  ErrorCode2[ErrorCode2["InternalError"] = -32603] = "InternalError";
})(ErrorCode || (ErrorCode = {}));
var JSONRPCErrorSchema = external_exports.object({
  jsonrpc: external_exports.literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  error: external_exports.object({
    /**
     * The error type that occurred.
     */
    code: external_exports.number().int(),
    /**
     * A short description of the error. The message SHOULD be limited to a concise single sentence.
     */
    message: external_exports.string(),
    /**
     * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    data: external_exports.optional(external_exports.unknown())
  })
}).strict();
var JSONRPCMessageSchema = external_exports.union([
  JSONRPCRequestSchema,
  JSONRPCNotificationSchema,
  JSONRPCResponseSchema,
  JSONRPCErrorSchema
]);
var EmptyResultSchema = ResultSchema.strict();
var CancelledNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/cancelled"),
  params: BaseNotificationParamsSchema.extend({
    /**
     * The ID of the request to cancel.
     *
     * This MUST correspond to the ID of a request previously issued in the same direction.
     */
    requestId: RequestIdSchema,
    /**
     * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
     */
    reason: external_exports.string().optional()
  })
});
var ImplementationSchema = external_exports.object({
  name: external_exports.string(),
  version: external_exports.string()
}).passthrough();
var ClientCapabilitiesSchema = external_exports.object({
  /**
   * Experimental, non-standard capabilities that the client supports.
   */
  experimental: external_exports.optional(external_exports.object({}).passthrough()),
  /**
   * Present if the client supports sampling from an LLM.
   */
  sampling: external_exports.optional(external_exports.object({}).passthrough()),
  /**
   * Present if the client supports listing roots.
   */
  roots: external_exports.optional(external_exports.object({
    /**
     * Whether the client supports issuing notifications for changes to the roots list.
     */
    listChanged: external_exports.optional(external_exports.boolean())
  }).passthrough())
}).passthrough();
var InitializeRequestSchema = RequestSchema.extend({
  method: external_exports.literal("initialize"),
  params: BaseRequestParamsSchema.extend({
    /**
     * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
     */
    protocolVersion: external_exports.string(),
    capabilities: ClientCapabilitiesSchema,
    clientInfo: ImplementationSchema
  })
});
var ServerCapabilitiesSchema = external_exports.object({
  /**
   * Experimental, non-standard capabilities that the server supports.
   */
  experimental: external_exports.optional(external_exports.object({}).passthrough()),
  /**
   * Present if the server supports sending log messages to the client.
   */
  logging: external_exports.optional(external_exports.object({}).passthrough()),
  /**
   * Present if the server offers any prompt templates.
   */
  prompts: external_exports.optional(external_exports.object({
    /**
     * Whether this server supports issuing notifications for changes to the prompt list.
     */
    listChanged: external_exports.optional(external_exports.boolean())
  }).passthrough()),
  /**
   * Present if the server offers any resources to read.
   */
  resources: external_exports.optional(external_exports.object({
    /**
     * Whether this server supports clients subscribing to resource updates.
     */
    subscribe: external_exports.optional(external_exports.boolean()),
    /**
     * Whether this server supports issuing notifications for changes to the resource list.
     */
    listChanged: external_exports.optional(external_exports.boolean())
  }).passthrough()),
  /**
   * Present if the server offers any tools to call.
   */
  tools: external_exports.optional(external_exports.object({
    /**
     * Whether this server supports issuing notifications for changes to the tool list.
     */
    listChanged: external_exports.optional(external_exports.boolean())
  }).passthrough())
}).passthrough();
var InitializeResultSchema = ResultSchema.extend({
  /**
   * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
   */
  protocolVersion: external_exports.string(),
  capabilities: ServerCapabilitiesSchema,
  serverInfo: ImplementationSchema
});
var InitializedNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/initialized")
});
var PingRequestSchema = RequestSchema.extend({
  method: external_exports.literal("ping")
});
var ProgressSchema = external_exports.object({
  /**
   * The progress thus far. This should increase every time progress is made, even if the total is unknown.
   */
  progress: external_exports.number(),
  /**
   * Total number of items to process (or total progress required), if known.
   */
  total: external_exports.optional(external_exports.number())
}).passthrough();
var ProgressNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/progress"),
  params: BaseNotificationParamsSchema.merge(ProgressSchema).extend({
    /**
     * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
     */
    progressToken: ProgressTokenSchema
  })
});
var PaginatedRequestSchema = RequestSchema.extend({
  params: BaseRequestParamsSchema.extend({
    /**
     * An opaque token representing the current pagination position.
     * If provided, the server should return results starting after this cursor.
     */
    cursor: external_exports.optional(CursorSchema)
  }).optional()
});
var PaginatedResultSchema = ResultSchema.extend({
  /**
   * An opaque token representing the pagination position after the last returned result.
   * If present, there may be more results available.
   */
  nextCursor: external_exports.optional(CursorSchema)
});
var ResourceContentsSchema = external_exports.object({
  /**
   * The URI of this resource.
   */
  uri: external_exports.string(),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: external_exports.optional(external_exports.string())
}).passthrough();
var TextResourceContentsSchema = ResourceContentsSchema.extend({
  /**
   * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
   */
  text: external_exports.string()
});
var BlobResourceContentsSchema = ResourceContentsSchema.extend({
  /**
   * A base64-encoded string representing the binary data of the item.
   */
  blob: external_exports.string().base64()
});
var ResourceSchema = external_exports.object({
  /**
   * The URI of this resource.
   */
  uri: external_exports.string(),
  /**
   * A human-readable name for this resource.
   *
   * This can be used by clients to populate UI elements.
   */
  name: external_exports.string(),
  /**
   * A description of what this resource represents.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description: external_exports.optional(external_exports.string()),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: external_exports.optional(external_exports.string())
}).passthrough();
var ResourceTemplateSchema = external_exports.object({
  /**
   * A URI template (according to RFC 6570) that can be used to construct resource URIs.
   */
  uriTemplate: external_exports.string(),
  /**
   * A human-readable name for the type of resource this template refers to.
   *
   * This can be used by clients to populate UI elements.
   */
  name: external_exports.string(),
  /**
   * A description of what this template is for.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description: external_exports.optional(external_exports.string()),
  /**
   * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
   */
  mimeType: external_exports.optional(external_exports.string())
}).passthrough();
var ListResourcesRequestSchema = PaginatedRequestSchema.extend({
  method: external_exports.literal("resources/list")
});
var ListResourcesResultSchema = PaginatedResultSchema.extend({
  resources: external_exports.array(ResourceSchema)
});
var ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
  method: external_exports.literal("resources/templates/list")
});
var ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
  resourceTemplates: external_exports.array(ResourceTemplateSchema)
});
var ReadResourceRequestSchema = RequestSchema.extend({
  method: external_exports.literal("resources/read"),
  params: BaseRequestParamsSchema.extend({
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
     */
    uri: external_exports.string()
  })
});
var ReadResourceResultSchema = ResultSchema.extend({
  contents: external_exports.array(external_exports.union([TextResourceContentsSchema, BlobResourceContentsSchema]))
});
var ResourceListChangedNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/resources/list_changed")
});
var SubscribeRequestSchema = RequestSchema.extend({
  method: external_exports.literal("resources/subscribe"),
  params: BaseRequestParamsSchema.extend({
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol; it is up to the server how to interpret it.
     */
    uri: external_exports.string()
  })
});
var UnsubscribeRequestSchema = RequestSchema.extend({
  method: external_exports.literal("resources/unsubscribe"),
  params: BaseRequestParamsSchema.extend({
    /**
     * The URI of the resource to unsubscribe from.
     */
    uri: external_exports.string()
  })
});
var ResourceUpdatedNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/resources/updated"),
  params: BaseNotificationParamsSchema.extend({
    /**
     * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
     */
    uri: external_exports.string()
  })
});
var PromptArgumentSchema = external_exports.object({
  /**
   * The name of the argument.
   */
  name: external_exports.string(),
  /**
   * A human-readable description of the argument.
   */
  description: external_exports.optional(external_exports.string()),
  /**
   * Whether this argument must be provided.
   */
  required: external_exports.optional(external_exports.boolean())
}).passthrough();
var PromptSchema = external_exports.object({
  /**
   * The name of the prompt or prompt template.
   */
  name: external_exports.string(),
  /**
   * An optional description of what this prompt provides
   */
  description: external_exports.optional(external_exports.string()),
  /**
   * A list of arguments to use for templating the prompt.
   */
  arguments: external_exports.optional(external_exports.array(PromptArgumentSchema))
}).passthrough();
var ListPromptsRequestSchema = PaginatedRequestSchema.extend({
  method: external_exports.literal("prompts/list")
});
var ListPromptsResultSchema = PaginatedResultSchema.extend({
  prompts: external_exports.array(PromptSchema)
});
var GetPromptRequestSchema = RequestSchema.extend({
  method: external_exports.literal("prompts/get"),
  params: BaseRequestParamsSchema.extend({
    /**
     * The name of the prompt or prompt template.
     */
    name: external_exports.string(),
    /**
     * Arguments to use for templating the prompt.
     */
    arguments: external_exports.optional(external_exports.record(external_exports.string()))
  })
});
var TextContentSchema = external_exports.object({
  type: external_exports.literal("text"),
  /**
   * The text content of the message.
   */
  text: external_exports.string()
}).passthrough();
var ImageContentSchema = external_exports.object({
  type: external_exports.literal("image"),
  /**
   * The base64-encoded image data.
   */
  data: external_exports.string().base64(),
  /**
   * The MIME type of the image. Different providers may support different image types.
   */
  mimeType: external_exports.string()
}).passthrough();
var EmbeddedResourceSchema = external_exports.object({
  type: external_exports.literal("resource"),
  resource: external_exports.union([TextResourceContentsSchema, BlobResourceContentsSchema])
}).passthrough();
var PromptMessageSchema = external_exports.object({
  role: external_exports.enum(["user", "assistant"]),
  content: external_exports.union([
    TextContentSchema,
    ImageContentSchema,
    EmbeddedResourceSchema
  ])
}).passthrough();
var GetPromptResultSchema = ResultSchema.extend({
  /**
   * An optional description for the prompt.
   */
  description: external_exports.optional(external_exports.string()),
  messages: external_exports.array(PromptMessageSchema)
});
var PromptListChangedNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/prompts/list_changed")
});
var ToolSchema = external_exports.object({
  /**
   * The name of the tool.
   */
  name: external_exports.string(),
  /**
   * A human-readable description of the tool.
   */
  description: external_exports.optional(external_exports.string()),
  /**
   * A JSON Schema object defining the expected parameters for the tool.
   */
  inputSchema: external_exports.object({
    type: external_exports.literal("object"),
    properties: external_exports.optional(external_exports.object({}).passthrough())
  }).passthrough()
}).passthrough();
var ListToolsRequestSchema = PaginatedRequestSchema.extend({
  method: external_exports.literal("tools/list")
});
var ListToolsResultSchema = PaginatedResultSchema.extend({
  tools: external_exports.array(ToolSchema)
});
var CallToolResultSchema = ResultSchema.extend({
  content: external_exports.array(external_exports.union([TextContentSchema, ImageContentSchema, EmbeddedResourceSchema])),
  isError: external_exports.boolean().default(false).optional()
});
var CompatibilityCallToolResultSchema = CallToolResultSchema.or(ResultSchema.extend({
  toolResult: external_exports.unknown()
}));
var CallToolRequestSchema = RequestSchema.extend({
  method: external_exports.literal("tools/call"),
  params: BaseRequestParamsSchema.extend({
    name: external_exports.string(),
    arguments: external_exports.optional(external_exports.record(external_exports.unknown()))
  })
});
var ToolListChangedNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/tools/list_changed")
});
var LoggingLevelSchema = external_exports.enum([
  "debug",
  "info",
  "notice",
  "warning",
  "error",
  "critical",
  "alert",
  "emergency"
]);
var SetLevelRequestSchema = RequestSchema.extend({
  method: external_exports.literal("logging/setLevel"),
  params: BaseRequestParamsSchema.extend({
    /**
     * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
     */
    level: LoggingLevelSchema
  })
});
var LoggingMessageNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/message"),
  params: BaseNotificationParamsSchema.extend({
    /**
     * The severity of this log message.
     */
    level: LoggingLevelSchema,
    /**
     * An optional name of the logger issuing this message.
     */
    logger: external_exports.optional(external_exports.string()),
    /**
     * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
     */
    data: external_exports.unknown()
  })
});
var ModelHintSchema = external_exports.object({
  /**
   * A hint for a model name.
   */
  name: external_exports.string().optional()
}).passthrough();
var ModelPreferencesSchema = external_exports.object({
  /**
   * Optional hints to use for model selection.
   */
  hints: external_exports.optional(external_exports.array(ModelHintSchema)),
  /**
   * How much to prioritize cost when selecting a model.
   */
  costPriority: external_exports.optional(external_exports.number().min(0).max(1)),
  /**
   * How much to prioritize sampling speed (latency) when selecting a model.
   */
  speedPriority: external_exports.optional(external_exports.number().min(0).max(1)),
  /**
   * How much to prioritize intelligence and capabilities when selecting a model.
   */
  intelligencePriority: external_exports.optional(external_exports.number().min(0).max(1))
}).passthrough();
var SamplingMessageSchema = external_exports.object({
  role: external_exports.enum(["user", "assistant"]),
  content: external_exports.union([TextContentSchema, ImageContentSchema])
}).passthrough();
var CreateMessageRequestSchema = RequestSchema.extend({
  method: external_exports.literal("sampling/createMessage"),
  params: BaseRequestParamsSchema.extend({
    messages: external_exports.array(SamplingMessageSchema),
    /**
     * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
     */
    systemPrompt: external_exports.optional(external_exports.string()),
    /**
     * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt. The client MAY ignore this request.
     */
    includeContext: external_exports.optional(external_exports.enum(["none", "thisServer", "allServers"])),
    temperature: external_exports.optional(external_exports.number()),
    /**
     * The maximum number of tokens to sample, as requested by the server. The client MAY choose to sample fewer tokens than requested.
     */
    maxTokens: external_exports.number().int(),
    stopSequences: external_exports.optional(external_exports.array(external_exports.string())),
    /**
     * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
     */
    metadata: external_exports.optional(external_exports.object({}).passthrough()),
    /**
     * The server's preferences for which model to select.
     */
    modelPreferences: external_exports.optional(ModelPreferencesSchema)
  })
});
var CreateMessageResultSchema = ResultSchema.extend({
  /**
   * The name of the model that generated the message.
   */
  model: external_exports.string(),
  /**
   * The reason why sampling stopped.
   */
  stopReason: external_exports.optional(external_exports.enum(["endTurn", "stopSequence", "maxTokens"]).or(external_exports.string())),
  role: external_exports.enum(["user", "assistant"]),
  content: external_exports.discriminatedUnion("type", [
    TextContentSchema,
    ImageContentSchema
  ])
});
var ResourceReferenceSchema = external_exports.object({
  type: external_exports.literal("ref/resource"),
  /**
   * The URI or URI template of the resource.
   */
  uri: external_exports.string()
}).passthrough();
var PromptReferenceSchema = external_exports.object({
  type: external_exports.literal("ref/prompt"),
  /**
   * The name of the prompt or prompt template
   */
  name: external_exports.string()
}).passthrough();
var CompleteRequestSchema = RequestSchema.extend({
  method: external_exports.literal("completion/complete"),
  params: BaseRequestParamsSchema.extend({
    ref: external_exports.union([PromptReferenceSchema, ResourceReferenceSchema]),
    /**
     * The argument's information
     */
    argument: external_exports.object({
      /**
       * The name of the argument
       */
      name: external_exports.string(),
      /**
       * The value of the argument to use for completion matching.
       */
      value: external_exports.string()
    }).passthrough()
  })
});
var CompleteResultSchema = ResultSchema.extend({
  completion: external_exports.object({
    /**
     * An array of completion values. Must not exceed 100 items.
     */
    values: external_exports.array(external_exports.string()).max(100),
    /**
     * The total number of completion options available. This can exceed the number of values actually sent in the response.
     */
    total: external_exports.optional(external_exports.number().int()),
    /**
     * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
     */
    hasMore: external_exports.optional(external_exports.boolean())
  }).passthrough()
});
var RootSchema = external_exports.object({
  /**
   * The URI identifying the root. This *must* start with file:// for now.
   */
  uri: external_exports.string().startsWith("file://"),
  /**
   * An optional name for the root.
   */
  name: external_exports.optional(external_exports.string())
}).passthrough();
var ListRootsRequestSchema = RequestSchema.extend({
  method: external_exports.literal("roots/list")
});
var ListRootsResultSchema = ResultSchema.extend({
  roots: external_exports.array(RootSchema)
});
var RootsListChangedNotificationSchema = NotificationSchema.extend({
  method: external_exports.literal("notifications/roots/list_changed")
});
var ClientRequestSchema = external_exports.union([
  PingRequestSchema,
  InitializeRequestSchema,
  CompleteRequestSchema,
  SetLevelRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  CallToolRequestSchema,
  ListToolsRequestSchema
]);
var ClientNotificationSchema = external_exports.union([
  CancelledNotificationSchema,
  ProgressNotificationSchema,
  InitializedNotificationSchema,
  RootsListChangedNotificationSchema
]);
var ClientResultSchema = external_exports.union([
  EmptyResultSchema,
  CreateMessageResultSchema,
  ListRootsResultSchema
]);
var ServerRequestSchema = external_exports.union([
  PingRequestSchema,
  CreateMessageRequestSchema,
  ListRootsRequestSchema
]);
var ServerNotificationSchema = external_exports.union([
  CancelledNotificationSchema,
  ProgressNotificationSchema,
  LoggingMessageNotificationSchema,
  ResourceUpdatedNotificationSchema,
  ResourceListChangedNotificationSchema,
  ToolListChangedNotificationSchema,
  PromptListChangedNotificationSchema
]);
var ServerResultSchema = external_exports.union([
  EmptyResultSchema,
  InitializeResultSchema,
  CompleteResultSchema,
  GetPromptResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListResourceTemplatesResultSchema,
  ReadResourceResultSchema,
  CallToolResultSchema,
  ListToolsResultSchema
]);
var McpError = class extends Error {
  constructor(code, message, data) {
    super(`MCP error ${code}: ${message}`);
    this.code = code;
    this.data = data;
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/shared/protocol.js
var DEFAULT_REQUEST_TIMEOUT_MSEC = 6e4;
var Protocol = class {
  constructor(_options) {
    this._options = _options;
    this._requestMessageId = 0;
    this._requestHandlers = /* @__PURE__ */ new Map();
    this._requestHandlerAbortControllers = /* @__PURE__ */ new Map();
    this._notificationHandlers = /* @__PURE__ */ new Map();
    this._responseHandlers = /* @__PURE__ */ new Map();
    this._progressHandlers = /* @__PURE__ */ new Map();
    this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
      const controller = this._requestHandlerAbortControllers.get(notification.params.requestId);
      controller === null || controller === void 0 ? void 0 : controller.abort(notification.params.reason);
    });
    this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
      this._onprogress(notification);
    });
    this.setRequestHandler(
      PingRequestSchema,
      // Automatic pong by default.
      (_request) => ({})
    );
  }
  /**
   * Attaches to the given transport, starts it, and starts listening for messages.
   *
   * The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
   */
  async connect(transport) {
    this._transport = transport;
    this._transport.onclose = () => {
      this._onclose();
    };
    this._transport.onerror = (error) => {
      this._onerror(error);
    };
    this._transport.onmessage = (message) => {
      if (!("method" in message)) {
        this._onresponse(message);
      } else if ("id" in message) {
        this._onrequest(message);
      } else {
        this._onnotification(message);
      }
    };
    await this._transport.start();
  }
  _onclose() {
    var _a;
    const responseHandlers = this._responseHandlers;
    this._responseHandlers = /* @__PURE__ */ new Map();
    this._progressHandlers.clear();
    this._transport = void 0;
    (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
    const error = new McpError(ErrorCode.ConnectionClosed, "Connection closed");
    for (const handler of responseHandlers.values()) {
      handler(error);
    }
  }
  _onerror(error) {
    var _a;
    (_a = this.onerror) === null || _a === void 0 ? void 0 : _a.call(this, error);
  }
  _onnotification(notification) {
    var _a;
    const handler = (_a = this._notificationHandlers.get(notification.method)) !== null && _a !== void 0 ? _a : this.fallbackNotificationHandler;
    if (handler === void 0) {
      return;
    }
    Promise.resolve().then(() => handler(notification)).catch((error) => this._onerror(new Error(`Uncaught error in notification handler: ${error}`)));
  }
  _onrequest(request) {
    var _a, _b;
    const handler = (_a = this._requestHandlers.get(request.method)) !== null && _a !== void 0 ? _a : this.fallbackRequestHandler;
    if (handler === void 0) {
      (_b = this._transport) === null || _b === void 0 ? void 0 : _b.send({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: ErrorCode.MethodNotFound,
          message: "Method not found"
        }
      }).catch((error) => this._onerror(new Error(`Failed to send an error response: ${error}`)));
      return;
    }
    const abortController = new AbortController();
    this._requestHandlerAbortControllers.set(request.id, abortController);
    Promise.resolve().then(() => handler(request, { signal: abortController.signal })).then((result) => {
      var _a2;
      if (abortController.signal.aborted) {
        return;
      }
      return (_a2 = this._transport) === null || _a2 === void 0 ? void 0 : _a2.send({
        result,
        jsonrpc: "2.0",
        id: request.id
      });
    }, (error) => {
      var _a2, _b2;
      if (abortController.signal.aborted) {
        return;
      }
      return (_a2 = this._transport) === null || _a2 === void 0 ? void 0 : _a2.send({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: Number.isSafeInteger(error["code"]) ? error["code"] : ErrorCode.InternalError,
          message: (_b2 = error.message) !== null && _b2 !== void 0 ? _b2 : "Internal error"
        }
      });
    }).catch((error) => this._onerror(new Error(`Failed to send response: ${error}`))).finally(() => {
      this._requestHandlerAbortControllers.delete(request.id);
    });
  }
  _onprogress(notification) {
    const { progress, total, progressToken } = notification.params;
    const handler = this._progressHandlers.get(Number(progressToken));
    if (handler === void 0) {
      this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
      return;
    }
    handler({ progress, total });
  }
  _onresponse(response) {
    const messageId = response.id;
    const handler = this._responseHandlers.get(Number(messageId));
    if (handler === void 0) {
      this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
      return;
    }
    this._responseHandlers.delete(Number(messageId));
    this._progressHandlers.delete(Number(messageId));
    if ("result" in response) {
      handler(response);
    } else {
      const error = new McpError(response.error.code, response.error.message, response.error.data);
      handler(error);
    }
  }
  get transport() {
    return this._transport;
  }
  /**
   * Closes the connection.
   */
  async close() {
    var _a;
    await ((_a = this._transport) === null || _a === void 0 ? void 0 : _a.close());
  }
  /**
   * Sends a request and wait for a response.
   *
   * Do not use this method to emit notifications! Use notification() instead.
   */
  request(request, resultSchema, options) {
    return new Promise((resolve2, reject) => {
      var _a, _b, _c, _d;
      if (!this._transport) {
        reject(new Error("Not connected"));
        return;
      }
      if (((_a = this._options) === null || _a === void 0 ? void 0 : _a.enforceStrictCapabilities) === true) {
        this.assertCapabilityForMethod(request.method);
      }
      (_b = options === null || options === void 0 ? void 0 : options.signal) === null || _b === void 0 ? void 0 : _b.throwIfAborted();
      const messageId = this._requestMessageId++;
      const jsonrpcRequest = {
        ...request,
        jsonrpc: "2.0",
        id: messageId
      };
      if (options === null || options === void 0 ? void 0 : options.onprogress) {
        this._progressHandlers.set(messageId, options.onprogress);
        jsonrpcRequest.params = {
          ...request.params,
          _meta: { progressToken: messageId }
        };
      }
      let timeoutId = void 0;
      this._responseHandlers.set(messageId, (response) => {
        var _a2;
        if (timeoutId !== void 0) {
          clearTimeout(timeoutId);
        }
        if ((_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.aborted) {
          return;
        }
        if (response instanceof Error) {
          return reject(response);
        }
        try {
          const result = resultSchema.parse(response.result);
          resolve2(result);
        } catch (error) {
          reject(error);
        }
      });
      const cancel = (reason) => {
        var _a2;
        this._responseHandlers.delete(messageId);
        this._progressHandlers.delete(messageId);
        (_a2 = this._transport) === null || _a2 === void 0 ? void 0 : _a2.send({
          jsonrpc: "2.0",
          method: "cancelled",
          params: {
            requestId: messageId,
            reason: String(reason)
          }
        }).catch((error) => this._onerror(new Error(`Failed to send cancellation: ${error}`)));
        reject(reason);
      };
      (_c = options === null || options === void 0 ? void 0 : options.signal) === null || _c === void 0 ? void 0 : _c.addEventListener("abort", () => {
        var _a2;
        if (timeoutId !== void 0) {
          clearTimeout(timeoutId);
        }
        cancel((_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.reason);
      });
      const timeout = (_d = options === null || options === void 0 ? void 0 : options.timeout) !== null && _d !== void 0 ? _d : DEFAULT_REQUEST_TIMEOUT_MSEC;
      timeoutId = setTimeout(() => cancel(new McpError(ErrorCode.RequestTimeout, "Request timed out", {
        timeout
      })), timeout);
      this._transport.send(jsonrpcRequest).catch((error) => {
        if (timeoutId !== void 0) {
          clearTimeout(timeoutId);
        }
        reject(error);
      });
    });
  }
  /**
   * Emits a notification, which is a one-way message that does not expect a response.
   */
  async notification(notification) {
    if (!this._transport) {
      throw new Error("Not connected");
    }
    this.assertNotificationCapability(notification.method);
    const jsonrpcNotification = {
      ...notification,
      jsonrpc: "2.0"
    };
    await this._transport.send(jsonrpcNotification);
  }
  /**
   * Registers a handler to invoke when this protocol object receives a request with the given method.
   *
   * Note that this will replace any previous request handler for the same method.
   */
  setRequestHandler(requestSchema, handler) {
    const method = requestSchema.shape.method.value;
    this.assertRequestHandlerCapability(method);
    this._requestHandlers.set(method, (request, extra) => Promise.resolve(handler(requestSchema.parse(request), extra)));
  }
  /**
   * Removes the request handler for the given method.
   */
  removeRequestHandler(method) {
    this._requestHandlers.delete(method);
  }
  /**
   * Registers a handler to invoke when this protocol object receives a notification with the given method.
   *
   * Note that this will replace any previous notification handler for the same method.
   */
  setNotificationHandler(notificationSchema, handler) {
    this._notificationHandlers.set(notificationSchema.shape.method.value, (notification) => Promise.resolve(handler(notificationSchema.parse(notification))));
  }
  /**
   * Removes the notification handler for the given method.
   */
  removeNotificationHandler(method) {
    this._notificationHandlers.delete(method);
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/server/index.js
var Server = class extends Protocol {
  /**
   * Initializes this server with the given name and version information.
   */
  constructor(_serverInfo, options) {
    super(options);
    this._serverInfo = _serverInfo;
    this._capabilities = options.capabilities;
    this.setRequestHandler(InitializeRequestSchema, (request) => this._oninitialize(request));
    this.setNotificationHandler(InitializedNotificationSchema, () => {
      var _a;
      return (_a = this.oninitialized) === null || _a === void 0 ? void 0 : _a.call(this);
    });
  }
  assertCapabilityForMethod(method) {
    var _a, _b;
    switch (method) {
      case "sampling/createMessage":
        if (!((_a = this._clientCapabilities) === null || _a === void 0 ? void 0 : _a.sampling)) {
          throw new Error(`Client does not support sampling (required for ${method})`);
        }
        break;
      case "roots/list":
        if (!((_b = this._clientCapabilities) === null || _b === void 0 ? void 0 : _b.roots)) {
          throw new Error(`Client does not support listing roots (required for ${method})`);
        }
        break;
      case "ping":
        break;
    }
  }
  assertNotificationCapability(method) {
    switch (method) {
      case "notifications/message":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "notifications/resources/updated":
      case "notifications/resources/list_changed":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support notifying about resources (required for ${method})`);
        }
        break;
      case "notifications/tools/list_changed":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support notifying of tool list changes (required for ${method})`);
        }
        break;
      case "notifications/prompts/list_changed":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support notifying of prompt list changes (required for ${method})`);
        }
        break;
      case "notifications/cancelled":
        break;
      case "notifications/progress":
        break;
    }
  }
  assertRequestHandlerCapability(method) {
    switch (method) {
      case "sampling/createMessage":
        if (!this._capabilities.sampling) {
          throw new Error(`Server does not support sampling (required for ${method})`);
        }
        break;
      case "logging/setLevel":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support prompts (required for ${method})`);
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support resources (required for ${method})`);
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support tools (required for ${method})`);
        }
        break;
      case "ping":
      case "initialize":
        break;
    }
  }
  async _oninitialize(request) {
    const requestedVersion = request.params.protocolVersion;
    this._clientCapabilities = request.params.capabilities;
    this._clientVersion = request.params.clientInfo;
    return {
      protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION,
      capabilities: this.getCapabilities(),
      serverInfo: this._serverInfo
    };
  }
  /**
   * After initialization has completed, this will be populated with the client's reported capabilities.
   */
  getClientCapabilities() {
    return this._clientCapabilities;
  }
  /**
   * After initialization has completed, this will be populated with information about the client's name and version.
   */
  getClientVersion() {
    return this._clientVersion;
  }
  getCapabilities() {
    return this._capabilities;
  }
  async ping() {
    return this.request({ method: "ping" }, EmptyResultSchema);
  }
  async createMessage(params, options) {
    return this.request({ method: "sampling/createMessage", params }, CreateMessageResultSchema, options);
  }
  async listRoots(params, options) {
    return this.request({ method: "roots/list", params }, ListRootsResultSchema, options);
  }
  async sendLoggingMessage(params) {
    return this.notification({ method: "notifications/message", params });
  }
  async sendResourceUpdated(params) {
    return this.notification({
      method: "notifications/resources/updated",
      params
    });
  }
  async sendResourceListChanged() {
    return this.notification({
      method: "notifications/resources/list_changed"
    });
  }
  async sendToolListChanged() {
    return this.notification({ method: "notifications/tools/list_changed" });
  }
  async sendPromptListChanged() {
    return this.notification({ method: "notifications/prompts/list_changed" });
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/server/stdio.js
var import_node_process = __toESM(require("node:process"), 1);

// node_modules/@modelcontextprotocol/sdk/dist/shared/stdio.js
var ReadBuffer = class {
  append(chunk) {
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
  }
  readMessage() {
    if (!this._buffer) {
      return null;
    }
    const index = this._buffer.indexOf("\n");
    if (index === -1) {
      return null;
    }
    const line = this._buffer.toString("utf8", 0, index);
    this._buffer = this._buffer.subarray(index + 1);
    return deserializeMessage(line);
  }
  clear() {
    this._buffer = void 0;
  }
};
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return JSON.stringify(message) + "\n";
}

// node_modules/@modelcontextprotocol/sdk/dist/server/stdio.js
var StdioServerTransport = class {
  constructor(_stdin = import_node_process.default.stdin, _stdout = import_node_process.default.stdout) {
    this._stdin = _stdin;
    this._stdout = _stdout;
    this._readBuffer = new ReadBuffer();
    this._started = false;
    this._ondata = (chunk) => {
      this._readBuffer.append(chunk);
      this.processReadBuffer();
    };
    this._onerror = (error) => {
      var _a;
      (_a = this.onerror) === null || _a === void 0 ? void 0 : _a.call(this, error);
    };
  }
  /**
   * Starts listening for messages on stdin.
   */
  async start() {
    if (this._started) {
      throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    var _a, _b;
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        (_a = this.onmessage) === null || _a === void 0 ? void 0 : _a.call(this, message);
      } catch (error) {
        (_b = this.onerror) === null || _b === void 0 ? void 0 : _b.call(this, error);
      }
    }
  }
  async close() {
    var _a;
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    this._readBuffer.clear();
    (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
  }
  send(message) {
    return new Promise((resolve2) => {
      const json = serializeMessage(message);
      if (this._stdout.write(json)) {
        resolve2();
      } else {
        this._stdout.once("drain", resolve2);
      }
    });
  }
};

// build/utils/auth.js
var import_dotenv = __toESM(require_main(), 1);
var import_path = require("path");
var import_url = require("url");
var DEFAULT_JIRA_URL = "https://myjira.disney.com";
var JiraAuth = class {
  jiraPat = null;
  jiraUrl = null;
  jiraEmail = null;
  loaded = false;
  loadEnv() {
    if (this.loaded)
      return;
    this.loaded = true;
    this.jiraPat = process.env.JIRA_PAT || null;
    this.jiraUrl = process.env.JIRA_URL || null;
    this.jiraEmail = process.env.JIRA_EMAIL || null;
    if (!this.jiraPat) {
      try {
        const __filename = (0, import_url.fileURLToPath)(__import_meta_url);
        const __dirname = (0, import_path.dirname)(__filename);
        const envPath = (0, import_path.resolve)(__dirname, "../../.env");
        (0, import_dotenv.config)({ path: envPath });
        this.jiraPat = process.env.JIRA_PAT || null;
        this.jiraUrl = this.jiraUrl || process.env.JIRA_URL || null;
        this.jiraEmail = this.jiraEmail || process.env.JIRA_EMAIL || null;
      } catch (e) {
      }
    }
  }
  async getJiraPat() {
    this.loadEnv();
    if (this.jiraPat)
      return this.jiraPat;
    throw new Error("JIRA_PAT not found. Set JIRA_PAT environment variable or add it to .env file.");
  }
  getBaseUrl() {
    this.loadEnv();
    return (this.jiraUrl || DEFAULT_JIRA_URL).replace(/\/+$/, "");
  }
  /** Returns true if configured for Jira Cloud (JIRA_EMAIL is set). */
  isCloud() {
    this.loadEnv();
    return !!this.jiraEmail;
  }
  /** Returns the correct API version path: /rest/api/3 for Cloud, /rest/api/2 for Server. */
  apiVersion() {
    return this.isCloud() ? "3" : "2";
  }
  /** Returns raw custom field entries from JIRA_CUSTOM_FIELDS (names or IDs, comma-separated). */
  getRawCustomFields() {
    this.loadEnv();
    const raw = process.env.JIRA_CUSTOM_FIELDS || "";
    return raw.split(",").map((f) => f.trim()).filter((f) => f.length > 0);
  }
  /** Returns the correct Authorization header for Cloud (Basic) or Server (Bearer). */
  async getAuthHeader() {
    this.loadEnv();
    const pat = await this.getJiraPat();
    if (this.jiraEmail) {
      return "Basic " + Buffer.from(this.jiraEmail + ":" + pat).toString("base64");
    }
    return "Bearer " + pat;
  }
};

// build/utils/jiraApi.js
function dedup(existing, incoming, key) {
  const seen = new Set(existing.map(key));
  return [...existing, ...incoming.filter((i) => !seen.has(key(i)))];
}
function toADF(text) {
  return {
    type: "doc",
    version: 1,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }]
  };
}
var JiraApiClient = class _JiraApiClient {
  auth = new JiraAuth();
  static fieldCache = null;
  /** Resolves custom field names to IDs. Caches the field list on first call. */
  async resolveCustomFields() {
    const raw = this.auth.getRawCustomFields();
    if (raw.length === 0)
      return [];
    if (raw.every((f) => f.startsWith("customfield_")))
      return raw;
    if (!_JiraApiClient.fieldCache) {
      try {
        const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/field`, { headers: { Authorization: await this.auth.getAuthHeader() } });
        if (response.ok) {
          const fields = await response.json();
          _JiraApiClient.fieldCache = /* @__PURE__ */ new Map();
          for (const f of fields) {
            _JiraApiClient.fieldCache.set(f.name.toLowerCase(), f.id);
          }
        } else {
          _JiraApiClient.fieldCache = /* @__PURE__ */ new Map();
        }
      } catch {
        _JiraApiClient.fieldCache = /* @__PURE__ */ new Map();
      }
    }
    return raw.map((entry) => {
      if (entry.startsWith("customfield_"))
        return entry;
      const id = _JiraApiClient.fieldCache.get(entry.toLowerCase());
      if (id)
        return id;
      console.error(`Custom field "${entry}" not found \u2014 skipping`);
      return "";
    }).filter((f) => f.length > 0);
  }
  get baseUrl() {
    return this.auth.getBaseUrl();
  }
  async fetchJiraTicket(ticketId, fields) {
    const defaultFields = [
      "summary",
      "description",
      "status",
      "assignee",
      "reporter",
      "priority",
      "created",
      "updated",
      "comment",
      "issuetype",
      "parent",
      "components",
      "subtasks",
      "labels",
      "issuelinks",
      "fixVersions"
    ];
    const requestedFields = fields || [...defaultFields, ...await this.resolveCustomFields()];
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}?fields=${requestedFields.join(",")}`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch JIRA ticket: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    console.error("Fetched ticket fields:", Object.keys(result.fields || {}));
    return result;
  }
  async updateJiraTicket(ticketId, updates) {
    console.error("Updating JIRA ticket with fields:", JSON.stringify(updates, null, 2));
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}`, {
      method: "PUT",
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: updates })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("JIRA API Error Response:", errorText);
      throw new Error(`Failed to update JIRA ticket: ${response.status} ${response.statusText} - ${errorText}`);
    }
    console.error("JIRA update successful");
  }
  async transitionJiraTicket(ticketId, transitionId) {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}/transitions`, {
      method: "POST",
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transition: { id: transitionId } })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to transition JIRA ticket: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }
  async getJiraTransitions(ticketId) {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}/transitions`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to get JIRA transitions: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
  async addJiraComment(ticketId, comment) {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}/comment`, {
      method: "POST",
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ body: this.auth.isCloud() ? toADF(comment) : comment })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add comment to JIRA ticket: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  async searchJiraIssues(jql, maxResults = 50, startAt = 0, extraFields = []) {
    const baseFields = [
      "summary",
      "status",
      "assignee",
      "reporter",
      "priority",
      "issuetype",
      "project",
      "created",
      "updated"
    ];
    const fields = [.../* @__PURE__ */ new Set([...baseFields, ...extraFields])];
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/search`, {
      method: "POST",
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jql,
        maxResults,
        startAt,
        fields
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search JIRA issues: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  async createJiraIssue(projectKey, summary, issueType, description, assignee, reporter, epicLink, components, labels, sprint, storyPoints, customFields) {
    const fields = {
      project: { key: projectKey },
      summary,
      issuetype: { name: issueType }
    };
    if (description) {
      fields.description = this.auth.isCloud() ? toADF(description) : description;
    }
    if (assignee) {
      fields.assignee = this.auth.isCloud() ? { accountId: assignee } : { name: assignee };
    }
    if (reporter) {
      fields.reporter = this.auth.isCloud() ? { accountId: reporter } : { name: reporter };
    }
    if (epicLink) {
      const { resolveCustomFieldIds: resolveCustomFieldIds2 } = await Promise.resolve().then(() => (init_customFields(), customFields_exports));
      const resolved = resolveCustomFieldIds2(["epicLink"]);
      if (resolved.length > 0) {
        fields[resolved[0]] = epicLink;
      }
    }
    if (storyPoints !== void 0) {
      const { resolveCustomFieldIds: resolveCustomFieldIds2 } = await Promise.resolve().then(() => (init_customFields(), customFields_exports));
      const resolved = resolveCustomFieldIds2(["storyPoints"]);
      if (resolved.length > 0) {
        fields[resolved[0]] = storyPoints;
      }
    }
    if (components && components.length > 0) {
      fields.components = components.map((name) => ({ name }));
    }
    if (labels && labels.length > 0) {
      fields.labels = labels;
    }
    if (sprint) {
      const { resolveCustomFieldIds: resolveCustomFieldIds2 } = await Promise.resolve().then(() => (init_customFields(), customFields_exports));
      const resolved = resolveCustomFieldIds2(["sprint"]);
      if (resolved.length > 0) {
        fields[resolved[0]] = Number(sprint);
      }
    }
    if (customFields && Object.keys(customFields).length > 0) {
      const { resolveCustomFieldIds: resolveCustomFieldIds2 } = await Promise.resolve().then(() => (init_customFields(), customFields_exports));
      for (const [key, value] of Object.entries(customFields)) {
        const resolved = resolveCustomFieldIds2([key]);
        if (resolved.length > 0) {
          fields[resolved[0]] = value;
        }
      }
    }
    console.error("Creating JIRA issue with fields:", JSON.stringify(fields, null, 2));
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue`, {
      method: "POST",
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("JIRA API Error Response:", errorText);
      throw new Error(`Failed to create JIRA issue: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  async getJiraProjects() {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/project`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get JIRA projects: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  async getJiraIssueTypes() {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issuetype`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get JIRA issue types: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  async getJiraBoards(projectKey, boardType, name, startAt = 0, maxResults = 50) {
    const params = new URLSearchParams({
      startAt: startAt.toString(),
      maxResults: maxResults.toString()
    });
    if (projectKey)
      params.append("projectKeyOrId", projectKey);
    if (boardType)
      params.append("type", boardType);
    if (name)
      params.append("name", name);
    const response = await fetch(`${this.baseUrl}/rest/agile/1.0/board?${params}`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get JIRA boards: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  async getJiraSprints(boardId, state, startAt = 0, maxResults = 50) {
    const params = new URLSearchParams({
      startAt: startAt.toString(),
      maxResults: maxResults.toString()
    });
    if (state)
      params.append("state", state);
    const response = await fetch(`${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint?${params}`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get JIRA sprints: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  async getJiraAttachments(ticketId) {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}?fields=attachment`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to get attachments: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result.fields?.attachment || [];
  }
  async downloadAttachment(url) {
    const response = await fetch(url, {
      headers: {
        Authorization: await this.auth.getAuthHeader()
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  async getJiraSprintIssues(sprintId, startAt = 0, maxResults = 50) {
    const params = new URLSearchParams({
      startAt: startAt.toString(),
      maxResults: maxResults.toString(),
      fields: "summary,status,assignee,reporter,priority,issuetype,project,created,updated,customfield_10004"
    });
    const response = await fetch(`${this.baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue?${params}`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get JIRA sprint issues: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  // ==========================================
  // XRay REST API Methods
  // ==========================================
  assertXRayServer() {
    if (this.auth.isCloud()) {
      throw new Error("XRay tools are not supported on Jira Cloud. XRay Cloud uses a different API (xray.cloud.getxray.app).");
    }
  }
  /**
   * Get all test steps for a Test issue
   * GET /rest/raven/2.0/api/test/{testKey}/step
   */
  async getXrayTestSteps(testKey) {
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/step`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test steps for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get a specific test step by ID
   * GET /rest/raven/2.0/api/test/{testKey}/step/{stepId}
   */
  async getXrayTestStep(testKey, stepId) {
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/step/${stepId}`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test step ${stepId} for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get tests associated with a Test Execution
   * GET /rest/raven/2.0/api/testexec/{testExecKey}/test
   */
  async getXrayTestExecTests(testExecKey, detailed = false, page, limit) {
    this.assertXRayServer();
    const params = new URLSearchParams();
    if (detailed)
      params.append("detailed", "true");
    if (page !== void 0)
      params.append("page", page.toString());
    if (limit !== void 0)
      params.append("limit", limit.toString());
    const queryString = params.toString();
    const url = `${this.baseUrl}/rest/raven/2.0/api/testexec/${testExecKey}/test${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test execution tests for ${testExecKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get pre-conditions for a Test
   * GET /rest/raven/2.0/api/test/{testKey}/precondition
   */
  async getXrayTestPreConditions(testKey) {
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/precondition`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay pre-conditions for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get test sets for a Test
   * GET /rest/raven/2.0/api/test/{testKey}/testset
   */
  async getXrayTestSets(testKey) {
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/testset`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test sets for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get test executions for a Test
   * GET /rest/raven/2.0/api/test/{testKey}/testexecution
   */
  async getXrayTestExecutions(testKey, page, limit) {
    this.assertXRayServer();
    const params = new URLSearchParams();
    if (page !== void 0)
      params.append("page", page.toString());
    if (limit !== void 0)
      params.append("limit", limit.toString());
    const queryString = params.toString();
    const url = `${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/testexecution${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test executions for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get test plans for a Test
   * GET /rest/raven/2.0/api/test/{testKey}/testplan
   */
  async getXrayTestPlans(testKey) {
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/testplan`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test plans for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get tests in a Test Plan
   * GET /rest/raven/2.0/api/testplan/{testPlanKey}/test
   */
  async getXrayTestPlanTests(testPlanKey, page, limit) {
    this.assertXRayServer();
    const params = new URLSearchParams();
    if (page !== void 0)
      params.append("page", page.toString());
    if (limit !== void 0)
      params.append("limit", limit.toString());
    const queryString = params.toString();
    const url = `${this.baseUrl}/rest/raven/2.0/api/testplan/${testPlanKey}/test${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test plan tests for ${testPlanKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get tests in a Test Set
   * GET /rest/raven/2.0/api/testset/{testSetKey}/test
   */
  async getXrayTestSetTests(testSetKey, page, limit) {
    this.assertXRayServer();
    const params = new URLSearchParams();
    if (page !== void 0)
      params.append("page", page.toString());
    if (limit !== void 0)
      params.append("limit", limit.toString());
    const queryString = params.toString();
    const url = `${this.baseUrl}/rest/raven/2.0/api/testset/${testSetKey}/test${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test set tests for ${testSetKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Export test runs (execution results)
   * GET /rest/raven/2.0/api/testruns
   */
  async getXrayTestRuns(testExecKey, testKey, testPlanKey, testEnvironments, page, limit) {
    this.assertXRayServer();
    const params = new URLSearchParams();
    if (testExecKey)
      params.append("testExecKey", testExecKey);
    if (testKey)
      params.append("testKey", testKey);
    if (testPlanKey)
      params.append("testPlanKey", testPlanKey);
    if (testEnvironments)
      params.append("testEnvironments", testEnvironments);
    if (page !== void 0)
      params.append("page", page.toString());
    if (limit !== void 0)
      params.append("limit", limit.toString());
    const queryString = params.toString();
    const url = `${this.baseUrl}/rest/raven/2.0/api/testruns${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test runs: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get all available test statuses in XRay
   * GET /rest/raven/2.0/api/settings/teststatuses
   */
  async getXrayTestStatuses() {
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/2.0/api/settings/teststatuses`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay test statuses: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get a full Test Case with all XRay details (steps, pre-conditions, test sets, executions, plans)
   * Combines multiple XRay API calls into one comprehensive response
   */
  async getXrayTestCaseFull(testKey) {
    this.assertXRayServer();
    this.assertXRayServer();
    const issueResponse = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${testKey}`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!issueResponse.ok) {
      throw new Error(`Failed to fetch issue ${testKey}: ${issueResponse.status} ${issueResponse.statusText}`);
    }
    const issue = await issueResponse.json();
    const [steps, preConditions, testSets, testExecutions, testPlans] = await Promise.allSettled([
      this.getXrayTestSteps(testKey),
      this.getXrayTestPreConditions(testKey),
      this.getXrayTestSets(testKey),
      this.getXrayTestExecutions(testKey),
      this.getXrayTestPlans(testKey)
    ]);
    return {
      issue,
      xray: {
        steps: steps.status === "fulfilled" ? steps.value : { error: steps.reason?.message },
        preConditions: preConditions.status === "fulfilled" ? preConditions.value : { error: preConditions.reason?.message },
        testSets: testSets.status === "fulfilled" ? testSets.value : { error: testSets.reason?.message },
        testExecutions: testExecutions.status === "fulfilled" ? testExecutions.value : { error: testExecutions.reason?.message },
        testPlans: testPlans.status === "fulfilled" ? testPlans.value : { error: testPlans.reason?.message }
      }
    };
  }
  /**
   * Get pre-condition tests (tests associated with a pre-condition issue)
   * GET /rest/raven/2.0/api/precondition/{preConditionKey}/test
   */
  async getXrayPreConditionTests(preConditionKey) {
    this.assertXRayServer();
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/2.0/api/precondition/${preConditionKey}/test`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get XRay pre-condition tests for ${preConditionKey}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  // ==========================================
  // Issue Link & User Methods
  // ==========================================
  /**
   * Create a link between two Jira issues.
   * POST /rest/api/{version}/issueLink
   */
  async linkJiraIssues(inwardTicketId, outwardTicketId, linkType) {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issueLink`, {
      method: "POST",
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: { name: linkType },
        inwardIssue: { key: inwardTicketId },
        outwardIssue: { key: outwardTicketId }
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to link JIRA issues: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }
  /**
   * Get all available issue link types.
   * GET /rest/api/{version}/issueLinkType
   */
  async getJiraIssueLinkTypes() {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issueLinkType`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get JIRA issue link types: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Get the currently authenticated user's profile.
   * GET /rest/api/{version}/myself
   */
  async getMyself() {
    const response = await fetch(`${this.baseUrl}/rest/api/${this.auth.apiVersion()}/myself`, {
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get current user: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  }
  // ==========================================
  // Development Status (Server-only)
  // ==========================================
  /**
   * Get development status (PRs, branches, commits) for an issue.
   * Server-only — the dev-status REST API is not available on Jira Cloud.
   * GET /rest/dev-status/1.0/issue/detail?issueId={id}&applicationType=githube&dataType={type}
   */
  async getDevStatus(issueId) {
    this.assertXRayServer();
    const dataTypes = ["pullrequest", "branch", "repository"];
    const results = await Promise.allSettled(dataTypes.map(async (dataType) => {
      const params = new URLSearchParams({
        issueId,
        applicationType: "githube",
        dataType
      });
      const response = await fetch(`${this.baseUrl}/rest/dev-status/1.0/issue/detail?${params}`, {
        headers: {
          Authorization: await this.auth.getAuthHeader(),
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get dev status (${dataType}): ${response.status} ${response.statusText} - ${errorText}`);
      }
      return await response.json();
    }));
    const mergedDetail = [];
    for (const result of results) {
      if (result.status === "fulfilled" && result.value?.detail) {
        for (const provider of result.value.detail) {
          const existing = mergedDetail.find((d) => d.instanceName === provider.instanceName);
          if (existing) {
            existing.pullRequests = dedup(existing.pullRequests || [], provider.pullRequests || [], (pr) => pr.url);
            existing.branches = dedup(existing.branches || [], provider.branches || [], (b) => b.url);
            existing.commits = dedup(existing.commits || [], provider.commits || [], (c) => c.id);
          } else {
            mergedDetail.push({ ...provider });
          }
        }
      }
    }
    return { detail: mergedDetail };
  }
  // ==========================================
  // XRay Write Methods (Server-only)
  // ==========================================
  /**
   * Add tests to a Test Execution.
   * POST /rest/raven/1.0/api/testexec/{testExecKey}/test
   */
  async addTestsToTestExec(testExecKey, testKeys) {
    this.assertXRayServer();
    const response = await fetch(`${this.baseUrl}/rest/raven/1.0/api/testexec/${testExecKey}/test`, {
      method: "POST",
      headers: {
        Authorization: await this.auth.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ add: testKeys })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to add tests to Test Execution ${testExecKey}: ${response.status} ${response.statusText} - ${errText}`);
    }
  }
};

// build/utils/formatting.js
init_customFields();
function formatDate(dateString) {
  if (!dateString)
    return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function buildFormattedSummary(ticket, requestedFields) {
  const summary = [`**${ticket.key}: ${ticket.fields.summary}**`, ""];
  if (requestedFields.includes("status") && ticket.fields.status) {
    summary.push(`**Status:** ${ticket.fields.status.name}`);
  }
  if (requestedFields.includes("assignee")) {
    summary.push(`**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}`);
  }
  if (requestedFields.includes("reporter")) {
    summary.push(`**Reporter:** ${ticket.fields.reporter?.displayName || "Unknown"}`);
  }
  if (requestedFields.includes("priority") && ticket.fields.priority) {
    summary.push(`**Priority:** ${ticket.fields.priority.name}`);
  }
  if (requestedFields.includes("created")) {
    summary.push(`**Created:** ${formatDate(ticket.fields.created)}`);
  }
  if (requestedFields.includes("updated")) {
    summary.push(`**Updated:** ${formatDate(ticket.fields.updated)}`);
  }
  if (requestedFields.includes("labels") && ticket.fields.labels?.length) {
    summary.push(`**Labels:** ${ticket.fields.labels.join(", ")}`);
  }
  if (requestedFields.includes("components") && ticket.fields.components?.length) {
    const componentNames = ticket.fields.components.map((c) => c.name).join(", ");
    summary.push(`**Components:** ${componentNames}`);
  }
  if (requestedFields.includes("description") && ticket.fields.description) {
    summary.push("", "**Description:**", ticket.fields.description);
  }
  if (requestedFields.includes("comment") && ticket.fields.comment?.comments?.length) {
    summary.push("", `**Comments (${ticket.fields.comment.comments.length}):**`);
    ticket.fields.comment.comments.forEach((comment, index) => {
      summary.push("", `**Comment ${index + 1}** by ${comment.author?.displayName || "Unknown"} on ${formatDate(comment.created)}:`, comment.body || "(no content)");
    });
  }
  if (requestedFields.includes("fixVersions") && ticket.fields.fixVersions?.length) {
    summary.push(`**Fix Versions:** ${ticket.fields.fixVersions.map((v) => v.name).join(", ")}`);
  }
  if (requestedFields.includes("storyPoints")) {
    const sp = ticket.fields[CUSTOM_FIELD_ALIASES.storyPoints];
    if (sp !== null && sp !== void 0) {
      summary.push(`**Story Points:** ${sp}`);
    }
  }
  if (requestedFields.includes("issuetype") && ticket.fields.issuetype) {
    summary.push(`**Issue Type:** ${ticket.fields.issuetype.name}`);
  }
  if (requestedFields.includes("parent") && ticket.fields.parent) {
    summary.push(`**Parent:** ${ticket.fields.parent.key} - ${ticket.fields.parent.fields?.summary || "Unknown"}`);
  }
  if (requestedFields.includes("subtasks") && ticket.fields.subtasks?.length) {
    summary.push("", `**Sub-tasks (${ticket.fields.subtasks.length}):**`);
    ticket.fields.subtasks.forEach((st) => {
      summary.push(`- ${st.key}: ${st.fields?.summary || "Unknown"} [${st.fields?.status?.name || "Unknown"}]`);
    });
  }
  if (requestedFields.includes("issuelinks") && ticket.fields.issuelinks?.length) {
    summary.push("", `**Issue Links (${ticket.fields.issuelinks.length}):**`);
    ticket.fields.issuelinks.forEach((link) => {
      if (link.outwardIssue) {
        summary.push(`- ${link.type?.outward || "relates to"}: ${link.outwardIssue.key} - ${link.outwardIssue.fields?.summary || "Unknown"}`);
      }
      if (link.inwardIssue) {
        summary.push(`- ${link.type?.inward || "relates to"}: ${link.inwardIssue.key} - ${link.inwardIssue.fields?.summary || "Unknown"}`);
      }
    });
  }
  return summary.join("\n");
}

// build/utils/fileUtils.js
var import_promises = require("fs/promises");
var import_path2 = require("path");
async function saveData(outputDir, filename, data, isGetOperation = true) {
  if (outputDir === false || outputDir === null)
    return null;
  const finalOutputDir = typeof outputDir === "string" ? outputDir : "/tmp/jira-mcp";
  if (!finalOutputDir)
    return null;
  await (0, import_promises.mkdir)(finalOutputDir, { recursive: true });
  const filepath = (0, import_path2.join)(finalOutputDir, filename);
  await (0, import_promises.writeFile)(filepath, JSON.stringify(data, null, 2));
  return filepath;
}
async function saveTicketData(outputDir, ticketId, ticket, summary, isGetOperation = true) {
  if (!shouldSaveOutput(outputDir, isGetOperation))
    return null;
  const finalOutputDir = typeof outputDir === "string" ? outputDir : "/tmp/jira-mcp";
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  const filename = `${ticketId}_${timestamp}.json`;
  const data = {
    ticketId,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    rawData: ticket,
    formattedSummary: summary
  };
  return saveData(finalOutputDir, filename, data, isGetOperation);
}
function shouldSaveOutput(outputDir, isGetOperation) {
  if (outputDir === false || outputDir === null)
    return false;
  return true;
}

// build/tools/jiraGetIssue.js
init_customFields();
var jiraGetIssueSchema = {
  name: "jira_get_issue",
  description: "Fetch a JIRA ticket by ID with support for custom fields. Optionally save to output directory.",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., ROS-1815)"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the ticket data (optional, defaults to .amazonq/external-data)"
      },
      fields: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "summary",
            "status",
            "assignee",
            "reporter",
            "priority",
            "created",
            "updated",
            "description",
            "comment",
            "labels",
            "components",
            "storyPoints",
            "customfield_10003"
          ]
        },
        description: "Optional: Fields to include in response (default: all current fields)"
      },
      customFields: {
        type: "array",
        items: { type: "string" },
        description: `Optional: Array of custom field IDs to fetch (e.g., ["customfield_20001", "customfield_10803"]). You can also use aliases: ${Object.keys(CUSTOM_FIELD_ALIASES).map((a) => `"${a}"`).join(", ")}`
      }
    },
    required: ["ticketId"]
  }
};
async function handleJiraGetIssue(args) {
  try {
    const { ticketId, outputDir, fields, customFields } = args;
    const defaultFields = [
      "summary",
      "status",
      "assignee",
      "reporter",
      "priority",
      "created",
      "description",
      "comment",
      "storyPoints"
    ];
    const requestedFields = fields || defaultFields;
    const expandedFields = requestedFields.map((f) => f === "storyPoints" ? "customfield_10004" : f);
    const resolvedCustomFields = customFields ? resolveCustomFieldIds(customFields) : [];
    const allFields = [.../* @__PURE__ */ new Set([...expandedFields, ...resolvedCustomFields])];
    const apiClient = new JiraApiClient();
    const ticket = await apiClient.fetchJiraTicket(ticketId, allFields);
    const summary = buildFormattedSummary(ticket, requestedFields);
    let customFieldSection = "";
    if (resolvedCustomFields.length > 0) {
      const lines = ["", "**Custom Fields:**"];
      for (const fieldId of resolvedCustomFields) {
        const label = getCustomFieldLabel(fieldId);
        const rawValue = ticket.fields[fieldId];
        const display = formatCustomFieldValue(rawValue);
        lines.push(`**${label}:** ${display}`);
      }
      customFieldSection = lines.join("\n");
    }
    const fullSummary = `${summary}${customFieldSection}`;
    const savedPath = await saveTicketData(outputDir, ticketId, ticket, fullSummary, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${fullSummary}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraUpdateIssue.js
init_customFields();
var jiraUpdateIssueSchema = {
  name: "jira_update_issue",
  description: "Update a JIRA ticket with support for custom fields and save the updated data",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., COREWEB-1815)"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the updated ticket data (optional)"
      },
      summary: {
        type: "string",
        description: "New ticket summary"
      },
      description: {
        type: "string",
        description: "New ticket description"
      },
      assignee: {
        type: "string",
        description: "Username of the new assignee"
      },
      epicLink: {
        type: "string",
        description: 'Epic ticket ID to link to (e.g., "SEWEB-46018") - will try common field IDs'
      },
      components: {
        type: "array",
        items: { type: "string" },
        description: 'Array of component names (e.g., ["Client Platforms & Misc"])'
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description: 'Array of label names (e.g., ["SPORTSWEB", "olympics", "2026"])'
      },
      priority: {
        type: "string",
        description: 'Priority name (e.g., "1 - Critical", "2 - High", "3 - Medium", "4 - Low")'
      },
      reporter: {
        type: "string",
        description: "Username of the reporter"
      },
      storyPoints: {
        type: "number",
        description: "Story points estimate"
      },
      customFields: {
        type: "object",
        description: `Custom fields as key-value pairs. Use field IDs or aliases. Example: {"studio": "ROS - BANG | Ruth", "storyPoints": 8}`
      }
    },
    required: ["ticketId"]
  }
};
async function handleJiraUpdateIssue(args) {
  try {
    const { ticketId, outputDir, summary, description, assignee, epicLink, components, labels, priority, reporter, storyPoints, customFields } = args;
    const apiClient = new JiraApiClient();
    const updates = {};
    if (summary)
      updates.summary = summary;
    if (description)
      updates.description = description;
    if (assignee)
      updates.assignee = { name: assignee };
    if (components && components.length > 0) {
      updates.components = components.map((name) => ({
        name
      }));
    }
    if (labels && labels.length > 0) {
      updates.labels = labels;
    }
    if (priority) {
      updates.priority = { name: priority };
    }
    if (reporter) {
      updates.reporter = apiClient.auth.isCloud() ? { accountId: reporter } : { name: reporter };
    }
    if (storyPoints !== void 0) {
      const spResolved = resolveCustomFieldIds(["storyPoints"]);
      if (spResolved.length > 0) {
        updates[spResolved[0]] = storyPoints;
      }
    }
    if (customFields) {
      for (const [key, value] of Object.entries(customFields)) {
        if (storyPoints !== void 0 && key.toLowerCase() === "storypoints")
          continue;
        const resolved = resolveCustomFieldIds([key]);
        if (resolved.length > 0) {
          updates[resolved[0]] = value;
        }
      }
    }
    if (epicLink) {
      const epicFieldIds = [
        "customfield_10014",
        "customfield_10008",
        "customfield_10006",
        "customfield_10002"
      ];
      for (const fieldId of epicFieldIds) {
        try {
          const testUpdates = {
            ...updates,
            [fieldId]: epicLink
          };
          console.error(`Trying Epic Link field ID: ${fieldId}`);
          await apiClient.updateJiraTicket(ticketId, testUpdates);
          console.error(`Success! Epic Link field ID is: ${fieldId}`);
          break;
        } catch (error) {
          console.error(`Failed with ${fieldId}: ${error instanceof Error ? error.message : "Unknown error"}`);
          if (fieldId === epicFieldIds[epicFieldIds.length - 1]) {
            console.error("All Epic Link field IDs failed, proceeding without Epic Link");
            await apiClient.updateJiraTicket(ticketId, updates);
          }
        }
      }
    } else {
      await apiClient.updateJiraTicket(ticketId, updates);
    }
    const ticket = await apiClient.fetchJiraTicket(ticketId);
    const summaryText = `**${ticket.key}: ${ticket.fields.summary}**

**Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}
**Reporter:** ${ticket.fields.reporter?.displayName || "Unknown"}
**Priority:** ${ticket.fields.priority?.name || "Unknown"}
**Story Points:** ${ticket.fields[resolveCustomFieldIds(["storyPoints"])[0]] ?? "Not set"}

**Description:**
${ticket.fields.description || "No description available"}`;
    const savedPath = await saveTicketData(outputDir, ticketId, ticket, summaryText, false);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `**Ticket Updated Successfully**

${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraTransitionIssue.js
var jiraTransitionIssueSchema = {
  name: "jira_transition_issue",
  description: "Transition a JIRA ticket to a new status",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., COREWEB-1815)"
      },
      status: {
        type: "string",
        description: 'Target status name (e.g., "In Progress", "Done")'
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the updated ticket data (optional)"
      }
    },
    required: ["ticketId", "status"]
  }
};
async function handleJiraTransitionIssue(args) {
  try {
    const { ticketId, status, outputDir } = args;
    const apiClient = new JiraApiClient();
    const transitions = await apiClient.getJiraTransitions(ticketId);
    const targetTransition = transitions.transitions.find((t) => t.name.toLowerCase() === status.toLowerCase());
    if (!targetTransition) {
      const availableStatuses = transitions.transitions.map((t) => t.name).join(", ");
      throw new Error(`Status "${status}" not available. Available transitions: ${availableStatuses}`);
    }
    await apiClient.transitionJiraTicket(ticketId, targetTransition.id);
    const ticket = await apiClient.fetchJiraTicket(ticketId);
    const summaryText = `**${ticket.key}: ${ticket.fields.summary}**

**Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}
**Priority:** ${ticket.fields.priority?.name || "Unknown"}

**Description:**
${ticket.fields.description || "No description available"}`;
    const savedPath = await saveTicketData(outputDir, ticketId, ticket, summaryText, false);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `**Ticket Transitioned Successfully**

${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error transitioning JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraAssignIssue.js
var jiraAssignIssueSchema = {
  name: "jira_assign_issue",
  description: "Assign a JIRA ticket to a user",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., COREWEB-1815)"
      },
      assignee: {
        type: "string",
        description: "Email or username of the assignee"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the updated ticket data (optional)"
      }
    },
    required: ["ticketId", "assignee"]
  }
};
async function handleJiraAssignIssue(args) {
  try {
    const { ticketId, assignee, outputDir } = args;
    const apiClient = new JiraApiClient();
    const updates = { assignee: { name: assignee } };
    await apiClient.updateJiraTicket(ticketId, updates);
    const ticket = await apiClient.fetchJiraTicket(ticketId);
    const summaryText = `**${ticket.key}: ${ticket.fields.summary}**

**Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}
**Priority:** ${ticket.fields.priority?.name || "Unknown"}

**Description:**
${ticket.fields.description || "No description available"}`;
    const savedPath = await saveTicketData(outputDir, ticketId, ticket, summaryText, false);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `**Ticket Assigned Successfully**

${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error assigning JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraCommentOnIssue.js
var import_promises2 = require("fs/promises");
var import_path3 = require("path");
var jiraCommentOnIssueSchema = {
  name: "jira_comment_on_issue",
  description: "Add a comment to a JIRA ticket",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., COREWEB-1815)"
      },
      comment: {
        type: "string",
        description: "The comment text to add"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the comment response data (optional)"
      }
    },
    required: ["ticketId", "comment"]
  }
};
async function handleJiraCommentOnIssue(args) {
  try {
    const { ticketId, comment, outputDir } = args;
    const apiClient = new JiraApiClient();
    const commentResponse = await apiClient.addJiraComment(ticketId, comment);
    const ticket = await apiClient.fetchJiraTicket(ticketId);
    const summaryText = `**Comment Added to ${ticket.key}: ${ticket.fields.summary}**

**Comment:** ${comment}

**Current Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}`;
    let savedPath = null;
    if (outputDir) {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const filepath = (0, import_path3.join)(outputDir, `${ticketId}_comment_${timestamp}.json`);
      await (0, import_promises2.mkdir)((0, import_path3.dirname)(filepath), { recursive: true });
      const data = {
        ticketId,
        comment,
        commentResponse,
        ticket,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        formattedSummary: summaryText
      };
      await (0, import_promises2.writeFile)(filepath, JSON.stringify(data, null, 2));
      savedPath = filepath;
    }
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `**Comment Added Successfully**

${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error adding comment to JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraSearchIssues.js
init_customFields();
var jiraSearchIssuesSchema = {
  name: "jira_search_issues",
  description: "Search JIRA issues using JQL (JIRA Query Language) with support for custom fields",
  inputSchema: {
    type: "object",
    properties: {
      jql: {
        type: "string",
        description: 'JQL query string (e.g., "project = COREWEB AND status = Open")'
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (default: 50)"
      },
      startAt: {
        type: "number",
        description: "Starting index for pagination (default: 0)"
      },
      customFields: {
        type: "array",
        items: { type: "string" },
        description: `Optional: Array of custom field IDs to include in results (e.g., ["customfield_20001", "customfield_10803"]). You can also use aliases: ${Object.keys(CUSTOM_FIELD_ALIASES).map((a) => `"${a}"`).join(", ")}`
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the search results (optional, defaults to .amazonq/external-data)"
      }
    },
    required: ["jql"]
  }
};
async function handleJiraSearchIssues(args) {
  try {
    const { jql, maxResults = 50, startAt = 0, customFields, outputDir } = args;
    const resolvedCustomFields = customFields ? resolveCustomFieldIds(customFields) : [];
    const apiClient = new JiraApiClient();
    const searchResults = await apiClient.searchJiraIssues(jql, maxResults, startAt, resolvedCustomFields);
    let summaryText = `**Search Results for JQL: "${jql}"**

**Total Found:** ${searchResults.total}
**Showing:** ${searchResults.issues.length} issues (starting at ${startAt})

`;
    searchResults.issues.forEach((issue, index) => {
      summaryText += `**${startAt + index + 1}. ${issue.key}: ${issue.fields.summary}**
- Status: ${issue.fields.status?.name || "Unknown"}
- Assignee: ${issue.fields.assignee?.displayName || "Unassigned"}
- Reporter: ${issue.fields.reporter?.displayName || "Unknown"}
- Priority: ${issue.fields.priority?.name || "Unknown"}
- Type: ${issue.fields.issuetype?.name || "Unknown"}
- Project: ${issue.fields.project?.key || "Unknown"}`;
      for (const fieldId of resolvedCustomFields) {
        const label = getCustomFieldLabel(fieldId);
        const display = formatCustomFieldValue(issue.fields[fieldId]);
        summaryText += `
- ${label}: ${display}`;
      }
      summaryText += "\n\n";
    });
    const savedPath = await saveData(outputDir, `search_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, {
      jql,
      maxResults,
      startAt,
      searchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawData: searchResults,
      formattedSummary: summaryText
    }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching JIRA issues: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraCreateIssue.js
var import_promises3 = require("fs/promises");
var import_path4 = require("path");
var jiraCreateIssueSchema = {
  name: "jira_create_issue",
  description: "Create a new JIRA issue with support for custom fields",
  inputSchema: {
    type: "object",
    properties: {
      projectKey: {
        type: "string",
        description: 'Project key (e.g., "COREWEB")'
      },
      summary: {
        type: "string",
        description: "Issue summary/title"
      },
      issueType: {
        type: "string",
        description: 'Issue type (e.g., "Bug", "Story", "Task")'
      },
      description: {
        type: "string",
        description: "Issue description (optional)"
      },
      assignee: {
        type: "string",
        description: "Username of assignee (optional)"
      },
      reporter: {
        type: "string",
        description: "Username of reporter (optional)"
      },
      epicLink: {
        type: "string",
        description: 'Epic ticket ID to link to (e.g., "SEWEB-46018") - NOTE: Epic Link field ID needs configuration per JIRA instance (optional)'
      },
      components: {
        type: "array",
        items: { type: "string" },
        description: 'Array of component names (e.g., ["Client Platforms & Misc"]) (optional)'
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description: 'Array of label names (e.g., ["SPORTSWEB", "olympics", "2026"]) (optional)'
      },
      sprint: {
        type: "string",
        description: "Sprint ID to assign the issue to (optional)"
      },
      storyPoints: {
        type: "number",
        description: "Story points estimate"
      },
      customFields: {
        type: "object",
        description: `Custom fields as key-value pairs. Use field IDs or aliases. Example: {"studio": "ROS - BANG | Ruth", "storyPoints": 5}`
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the created issue data (optional)"
      }
    },
    required: ["projectKey", "summary", "issueType"]
  }
};
async function handleJiraCreateIssue(args) {
  try {
    const { projectKey, summary, issueType, description, assignee, epicLink, components, labels, sprint, storyPoints, reporter, customFields, outputDir } = args;
    const apiClient = new JiraApiClient();
    const createResponse = await apiClient.createJiraIssue(projectKey, summary, issueType, description, assignee, reporter, epicLink, components, labels, sprint, storyPoints, customFields);
    const ticket = await apiClient.fetchJiraTicket(createResponse.key);
    let summaryText = `**Issue Created Successfully: ${ticket.key}**

**${ticket.key}: ${ticket.fields.summary}**

**Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}
**Priority:** ${ticket.fields.priority?.name || "Unknown"}
**Reporter:** ${ticket.fields.reporter?.displayName || "Unknown"}
**Type:** ${issueType}
**Story Points:** ${storyPoints !== void 0 ? storyPoints : "Not set"}
**Project:** ${projectKey}`;
    if (epicLink) {
      summaryText += `
**Epic Link:** ${epicLink} (WARNING: Not set - field ID needs configuration)`;
    }
    if (components && components.length > 0) {
      summaryText += `
**Components:** ${components.join(", ")}`;
    }
    if (labels && labels.length > 0) {
      summaryText += `
**Labels:** ${labels.join(", ")}`;
    }
    summaryText += `

**Description:**
${ticket.fields.description || "No description provided"}`;
    let savedPath = null;
    if (outputDir) {
      await (0, import_promises3.mkdir)(outputDir, { recursive: true });
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const filename = `${createResponse.key}_created_${timestamp}.json`;
      const filepath = (0, import_path4.join)(outputDir, filename);
      const data = {
        createdIssue: createResponse,
        fullTicketData: ticket,
        customFields: { epicLink, components, labels },
        warnings: epicLink ? [
          "Epic Link field ID not configured for this JIRA instance"
        ] : [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        formattedSummary: summaryText
      };
      await (0, import_promises3.writeFile)(filepath, JSON.stringify(data, null, 2));
      savedPath = filepath;
    }
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}

**Issue URL:** ${apiClient.auth.getBaseUrl()}/browse/${createResponse.key}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating JIRA issue: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetProjects.js
var jiraGetProjectsSchema = {
  name: "jira_get_projects",
  description: "Get all JIRA projects",
  inputSchema: {
    type: "object",
    properties: {
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the projects data (optional, defaults to .amazonq/external-data)"
      }
    },
    required: []
  }
};
async function handleJiraGetProjects(args) {
  try {
    const { outputDir } = args;
    const apiClient = new JiraApiClient();
    const projects = await apiClient.getJiraProjects();
    let summaryText = `**JIRA Projects**

**Total Projects:** ${projects.length}

`;
    projects.forEach((project, index) => {
      summaryText += `**${index + 1}. ${project.key}: ${project.name}**
- Lead: ${project.lead?.displayName || "Unknown"}
- Type: ${project.projectTypeKey || "Unknown"}
- Category: ${project.projectCategory?.name || "None"}

`;
    });
    const savedPath = await saveData(outputDir, `projects_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, {
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawData: projects,
      formattedSummary: summaryText
    }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching JIRA projects: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetIssueTypes.js
var jiraGetIssueTypesSchema = {
  name: "jira_get_issue_types",
  description: "Get all JIRA issue types",
  inputSchema: {
    type: "object",
    properties: {
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the issue types data (optional, defaults to .amazonq/external-data)"
      }
    },
    required: []
  }
};
async function handleJiraGetIssueTypes(args) {
  try {
    const { outputDir } = args;
    const apiClient = new JiraApiClient();
    const issueTypes = await apiClient.getJiraIssueTypes();
    let summaryText = `**JIRA Issue Types**

**Total Issue Types:** ${issueTypes.length}

`;
    issueTypes.forEach((issueType, index) => {
      summaryText += `**${index + 1}. ${issueType.name}**
- ID: ${issueType.id}
- Description: ${issueType.description || "No description"}
- Subtask: ${issueType.subtask ? "Yes" : "No"}

`;
    });
    const savedPath = await saveData(outputDir, `issue_types_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, {
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawData: issueTypes,
      formattedSummary: summaryText
    }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching JIRA issue types: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetTransitions.js
var jiraGetTransitionsSchema = {
  name: "jira_get_transitions",
  description: "Get available transitions for a JIRA issue",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., COREWEB-1815)"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the transitions data (optional, defaults to .amazonq/external-data)"
      }
    },
    required: ["ticketId"]
  }
};
async function handleJiraGetTransitions(args) {
  try {
    const { ticketId, outputDir } = args;
    const apiClient = new JiraApiClient();
    const transitions = await apiClient.getJiraTransitions(ticketId);
    let summaryText = `**Available Transitions for ${ticketId}**

**Total Transitions:** ${transitions.transitions.length}

`;
    transitions.transitions.forEach((transition, index) => {
      summaryText += `**${index + 1}. ${transition.name}**
- ID: ${transition.id}
- To Status: ${transition.to?.name || "Unknown"}

`;
    });
    const savedPath = await saveData(outputDir, `${ticketId}_transitions_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, {
      ticketId,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawData: transitions,
      formattedSummary: summaryText
    }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching JIRA transitions: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetBoards.js
var jiraGetBoardsSchema = {
  name: "jira_get_boards",
  description: "Get JIRA agile boards",
  inputSchema: {
    type: "object",
    properties: {
      projectKey: {
        type: "string",
        description: "Filter by project key (optional)"
      },
      boardType: {
        type: "string",
        description: 'Filter by board type: "scrum" or "kanban" (optional)'
      },
      name: {
        type: "string",
        description: "Filter by board name (optional)"
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results (default: 50)"
      },
      startAt: {
        type: "number",
        description: "Starting index for pagination (default: 0)"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the boards data (optional, defaults to .amazonq/external-data)"
      }
    },
    required: []
  }
};
async function handleJiraGetBoards(args) {
  try {
    const { projectKey, boardType, name, maxResults = 50, startAt = 0, outputDir } = args;
    const apiClient = new JiraApiClient();
    const boards = await apiClient.getJiraBoards(projectKey, boardType, name, startAt, maxResults);
    let summaryText = `**JIRA Agile Boards**`;
    if (projectKey)
      summaryText += ` (Project: ${projectKey})`;
    if (boardType)
      summaryText += ` (Type: ${boardType})`;
    if (name)
      summaryText += ` (Name filter: ${name})`;
    summaryText += `

**Total Found:** ${boards.total}
**Showing:** ${boards.values.length} boards (starting at ${startAt})

`;
    boards.values.forEach((board, index) => {
      summaryText += `**${startAt + index + 1}. ${board.name}**
- ID: ${board.id}
- Type: ${board.type}
- Location: ${board.location?.displayName || "Unknown"}

`;
    });
    const savedPath = await saveData(outputDir, `boards_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, {
      filters: {
        projectKey,
        boardType,
        name,
        maxResults,
        startAt
      },
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawData: boards,
      formattedSummary: summaryText
    }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching JIRA boards: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetSprints.js
var jiraGetSprintsSchema = {
  name: "jira_get_sprints",
  description: "Get sprints for a JIRA agile board",
  inputSchema: {
    type: "object",
    properties: {
      boardId: {
        type: "string",
        description: "Board ID to get sprints for"
      },
      state: {
        type: "string",
        description: 'Filter by sprint state: "active", "closed", "future" (optional)'
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results (default: 50)"
      },
      startAt: {
        type: "number",
        description: "Starting index for pagination (default: 0)"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the sprints data (optional, defaults to .amazonq/external-data)"
      }
    },
    required: ["boardId"]
  }
};
async function handleJiraGetSprints(args) {
  try {
    const { boardId, state, maxResults = 50, startAt = 0, outputDir } = args;
    const apiClient = new JiraApiClient();
    const sprints = await apiClient.getJiraSprints(boardId, state, startAt, maxResults);
    let summaryText = `**Sprints for Board ${boardId}**`;
    if (state)
      summaryText += ` (State: ${state})`;
    summaryText += `

**Total Found:** ${sprints.total}
**Showing:** ${sprints.values.length} sprints (starting at ${startAt})

`;
    sprints.values.forEach((sprint, index) => {
      summaryText += `**${startAt + index + 1}. ${sprint.name}**
- ID: ${sprint.id}
- State: ${sprint.state}
- Start: ${sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "Not set"}
- End: ${sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "Not set"}
- Goal: ${sprint.goal || "No goal set"}

`;
    });
    const savedPath = await saveData(outputDir, `board_${boardId}_sprints_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, {
      boardId,
      filters: { state, maxResults, startAt },
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawData: sprints,
      formattedSummary: summaryText
    }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching JIRA sprints: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetSprintIssues.js
init_customFields();
var jiraGetSprintIssuesSchema = {
  name: "jira_get_sprint_issues",
  description: "Get issues in a specific JIRA sprint",
  inputSchema: {
    type: "object",
    properties: {
      sprintId: {
        type: "string",
        description: "Sprint ID to get issues for"
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results (default: 50)"
      },
      startAt: {
        type: "number",
        description: "Starting index for pagination (default: 0)"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the sprint issues data (optional, defaults to .amazonq/external-data)"
      }
    },
    required: ["sprintId"]
  }
};
async function handleJiraGetSprintIssues(args) {
  try {
    const { sprintId, maxResults = 50, startAt = 0, outputDir } = args;
    const apiClient = new JiraApiClient();
    const sprintIssues = await apiClient.getJiraSprintIssues(sprintId, startAt, maxResults);
    let summaryText = `**Issues in Sprint ${sprintId}**

**Total Found:** ${sprintIssues.total}
**Showing:** ${sprintIssues.issues.length} issues (starting at ${startAt})

`;
    sprintIssues.issues.forEach((issue, index) => {
      const sp = issue.fields[CUSTOM_FIELD_ALIASES.storyPoints];
      summaryText += `**${startAt + index + 1}. ${issue.key}: ${issue.fields.summary}**
- Status: ${issue.fields.status?.name || "Unknown"}
- Assignee: ${issue.fields.assignee?.displayName || "Unassigned"}
- Reporter: ${issue.fields.reporter?.displayName || "Unknown"}
- Priority: ${issue.fields.priority?.name || "Unknown"}
- Type: ${issue.fields.issuetype?.name || "Unknown"}
- Story Points: ${sp !== null && sp !== void 0 ? sp : "Not set"}
- Project: ${issue.fields.project?.key || "Unknown"}

`;
    });
    const savedPath = await saveData(outputDir, `sprint_${sprintId}_issues_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, {
      sprintId,
      filters: { maxResults, startAt },
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawData: sprintIssues,
      formattedSummary: summaryText
    }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return {
      content: [
        {
          type: "text",
          text: `${summaryText}${savedInfo}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching JIRA sprint issues: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetAttachments.js
var import_promises4 = require("fs/promises");
var import_path5 = require("path");
var jiraGetAttachmentsSchema = {
  name: "jira_get_attachments",
  description: "Get attachments from a JIRA ticket. Can list attachments or download a specific one. For images, downloads and saves to disk so they can be viewed.",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., REMY-41705)"
      },
      download: {
        type: "boolean",
        description: "If true, downloads all attachments to outputDir. If false (default), just lists them."
      },
      attachmentFilename: {
        type: "string",
        description: "Optional: Download only the attachment with this filename"
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save downloaded attachments (defaults to .amazonq/external-data/attachments/{ticketId})"
      }
    },
    required: ["ticketId"]
  }
};
async function handleJiraGetAttachments(args) {
  try {
    const { ticketId, download, attachmentFilename, outputDir } = args;
    const apiClient = new JiraApiClient();
    const attachments = await apiClient.getJiraAttachments(ticketId);
    if (attachments.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `**${ticketId}** has no attachments.`
          }
        ]
      };
    }
    const attachmentList = attachments.map((att, i) => {
      const sizeKB = Math.round((att.size || 0) / 1024);
      return `${i + 1}. **${att.filename}** (${att.mimeType}, ${sizeKB}KB) - Created: ${att.created}`;
    });
    let summaryText = `**Attachments for ${ticketId}** (${attachments.length} files)

${attachmentList.join("\n")}`;
    if (download) {
      const saveDir = typeof outputDir === "string" ? outputDir : `/tmp/jira-mcp/attachments/${ticketId}`;
      await (0, import_promises4.mkdir)(saveDir, { recursive: true });
      const downloaded = [];
      for (const att of attachments) {
        if (attachmentFilename && att.filename !== attachmentFilename) {
          continue;
        }
        try {
          const buffer = await apiClient.downloadAttachment(att.content);
          const filePath = (0, import_path5.join)(saveDir, att.filename);
          await (0, import_promises4.writeFile)(filePath, buffer);
          downloaded.push(`\u2705 ${att.filename} \u2192 ${filePath}`);
        } catch (err) {
          downloaded.push(`\u274C ${att.filename} \u2192 Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
      summaryText += `

**Downloaded to ${saveDir}:**
${downloaded.join("\n")}`;
    }
    return {
      content: [
        {
          type: "text",
          text: summaryText
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting attachments: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetChildIssues.js
var jiraGetChildIssuesSchema = {
  name: "jira_get_child_issues",
  description: "Get all child issues (sub-tasks, stories, etc.) of a parent JIRA ticket.",
  inputSchema: {
    type: "object",
    properties: {
      parentKey: {
        type: "string",
        description: "The parent JIRA ticket key (e.g., DPAY-1234)"
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results (default: 100)"
      }
    },
    required: ["parentKey"]
  }
};
async function handleJiraGetChildIssues(args) {
  try {
    const { parentKey, maxResults = 100 } = args;
    if (!/^[A-Z][A-Z0-9_]+-\d+$/.test(parentKey)) {
      throw new Error(`Invalid JIRA key format: ${parentKey}`);
    }
    const apiClient = new JiraApiClient();
    const jql = `parent = ${parentKey} ORDER BY created ASC`;
    const result = await apiClient.searchJiraIssues(jql, maxResults, 0, [
      "issuetype"
    ]);
    const issues = result.issues || [];
    let text = `**Child Issues of ${parentKey}** (${result.total} total)

`;
    issues.forEach((issue, i) => {
      const f = issue.fields || {};
      text += `**${i + 1}. ${issue.key}: ${f.summary || "(no summary)"}**
`;
      text += `- Type: ${f.issuetype?.name || "Unknown"}
`;
      text += `- Status: ${f.status?.name || "Unknown"}
`;
      text += `- Assignee: ${f.assignee?.displayName || "Unassigned"}
`;
      text += `- Priority: ${f.priority?.name || "Unknown"}

`;
    });
    if (issues.length === 0)
      text += "No child issues found.\n";
    if (result.total > issues.length) {
      text += `
_Showing ${issues.length} of ${result.total} children._
`;
    }
    return { content: [{ type: "text", text }] };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestCaseFull.js
var xrayGetTestCaseFullSchema = {
  name: "xray_get_test_case_full",
  description: "Get a complete XRay Test Case with all details: Jira issue fields (summary, description, priority, status, labels, components, custom fields), test steps, pre-conditions, test sets, test executions, test plans, and recent test runs. This is the most comprehensive tool for inspecting a test case.",
  inputSchema: {
    type: "object",
    properties: {
      testKey: {
        type: "string",
        description: "The JIRA Test issue key (e.g., DPAY-1234)"
      },
      includeTestRuns: {
        type: "boolean",
        description: "If true, also fetches recent test run results for this test (default: true)"
      }
    },
    required: ["testKey"]
  }
};
async function handleXrayGetTestCaseFull(args) {
  try {
    const { testKey, includeTestRuns = true } = args;
    const apiClient = new JiraApiClient();
    const result = await apiClient.getXrayTestCaseFull(testKey);
    const issue = result.issue;
    const xray = result.xray;
    const fields = issue.fields || {};
    let text = `**${issue.key}: ${fields.summary || "(no summary)"}**

`;
    text += `**Type:** ${fields.issuetype?.name || "Unknown"}
`;
    text += `**Status:** ${fields.status?.name || "Unknown"}
`;
    text += `**Priority:** ${fields.priority?.name || "Unknown"}
`;
    text += `**Assignee:** ${fields.assignee?.displayName || "Unassigned"}
`;
    text += `**Reporter:** ${fields.reporter?.displayName || "Unknown"}
`;
    text += `**Created:** ${fields.created || "Unknown"}
`;
    text += `**Updated:** ${fields.updated || "Unknown"}
`;
    if (fields.labels?.length) {
      text += `**Labels:** ${fields.labels.join(", ")}
`;
    }
    if (fields.components?.length) {
      text += `**Components:** ${fields.components.map((c) => c.name).join(", ")}
`;
    }
    if (fields.fixVersions?.length) {
      text += `**Fix Versions:** ${fields.fixVersions.map((v) => v.name).join(", ")}
`;
    }
    if (fields.description) {
      text += `
**Description:**
${fields.description}
`;
    }
    const customFieldKeys = Object.keys(fields).filter((k) => k.startsWith("customfield_") && fields[k] != null);
    if (customFieldKeys.length > 0) {
      text += `
**Custom/XRay Fields:**
`;
      for (const key of customFieldKeys) {
        const val = fields[key];
        const displayVal = typeof val === "object" ? JSON.stringify(val) : String(val);
        if (displayVal.length < 500) {
          text += `- ${key}: ${displayVal}
`;
        } else {
          text += `- ${key}: (large value, ${displayVal.length} chars)
`;
        }
      }
    }
    text += `
---
**Test Steps:**
`;
    if (xray.steps?.error) {
      text += `(Error fetching steps: ${xray.steps.error})
`;
    } else if (Array.isArray(xray.steps) && xray.steps.length > 0) {
      xray.steps.forEach((step, i) => {
        const idx = step.index ?? i + 1;
        text += `  ${idx}. Action: ${step.fields?.action || step.action || "(none)"}
`;
        text += `     Data: ${step.fields?.data || step.data || "(none)"}
`;
        text += `     Expected: ${step.fields?.["expected result"] || step.fields?.expectedResult || step.result || "(none)"}
`;
      });
    } else {
      text += "(no steps)\n";
    }
    text += `
**Pre-Conditions:**
`;
    if (xray.preConditions?.error) {
      text += `(Error: ${xray.preConditions.error})
`;
    } else if (Array.isArray(xray.preConditions) && xray.preConditions.length > 0) {
      xray.preConditions.forEach((pc) => {
        text += `- ${pc.key}: ${pc.condition || pc.summary || "(no description)"} (Type: ${pc.type || "Unknown"})
`;
      });
    } else {
      text += "(none)\n";
    }
    text += `
**Test Sets:**
`;
    if (xray.testSets?.error) {
      text += `(Error: ${xray.testSets.error})
`;
    } else if (Array.isArray(xray.testSets) && xray.testSets.length > 0) {
      xray.testSets.forEach((ts) => {
        text += `- ${ts.key}: ${ts.summary || "(no summary)"}
`;
      });
    } else {
      text += "(none)\n";
    }
    text += `
**Test Executions:**
`;
    if (xray.testExecutions?.error) {
      text += `(Error: ${xray.testExecutions.error})
`;
    } else {
      const execs = Array.isArray(xray.testExecutions) ? xray.testExecutions : xray.testExecutions?.issues || xray.testExecutions;
      if (Array.isArray(execs) && execs.length > 0) {
        execs.forEach((te) => {
          text += `- ${te.key}: ${te.summary || "(no summary)"} \u2014 Status: ${te.status || "Unknown"}
`;
        });
      } else {
        text += "(none)\n";
      }
    }
    text += `
**Test Plans:**
`;
    if (xray.testPlans?.error) {
      text += `(Error: ${xray.testPlans.error})
`;
    } else if (Array.isArray(xray.testPlans) && xray.testPlans.length > 0) {
      xray.testPlans.forEach((tp) => {
        text += `- ${tp.key}: ${tp.summary || "(no summary)"}
`;
      });
    } else {
      text += "(none)\n";
    }
    if (includeTestRuns) {
      text += `
**Recent Test Runs:**
`;
      try {
        const runs = await apiClient.getXrayTestRuns(void 0, testKey, void 0, void 0, void 0, 10);
        const runList = Array.isArray(runs) ? runs : runs?.testRuns || runs;
        if (Array.isArray(runList) && runList.length > 0) {
          runList.forEach((run, i) => {
            text += `- ${run.testExecKey || "Unknown Exec"}: ${run.status || "Unknown"} (${run.executedBy || "Unknown"}, ${run.finishedOn || run.startedOn || "Unknown date"})`;
            if (run.defects?.length) {
              text += ` \u2014 Defects: ${run.defects.map((d) => d.key || d).join(", ")}`;
            }
            text += "\n";
          });
        } else {
          text += "(no test runs)\n";
        }
      } catch {
        text += "(unable to fetch test runs)\n";
      }
    }
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting XRay test case: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestSteps.js
var xrayGetTestStepsSchema = {
  name: "xray_get_test_steps",
  description: "Get all test steps for an XRay Test issue, including action, data, expected result, and attachments for each step",
  inputSchema: {
    type: "object",
    properties: {
      testKey: {
        type: "string",
        description: "The JIRA Test issue key (e.g., DPAY-1234)"
      }
    },
    required: ["testKey"]
  }
};
async function handleXrayGetTestSteps(args) {
  try {
    const { testKey } = args;
    const apiClient = new JiraApiClient();
    const steps = await apiClient.getXrayTestSteps(testKey);
    if (!Array.isArray(steps) || steps.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No test steps found for ${testKey}.`
          }
        ]
      };
    }
    let text = `**Test Steps for ${testKey}** (${steps.length} steps)

`;
    steps.forEach((step, index) => {
      const stepIndex = step.index ?? index + 1;
      text += `**Step ${stepIndex}:**
`;
      text += `- Action: ${step.fields?.action || step.action || "(none)"}
`;
      text += `- Data: ${step.fields?.data || step.data || "(none)"}
`;
      text += `- Expected Result: ${step.fields?.["expected result"] || step.fields?.expectedResult || step.result || "(none)"}
`;
      if (step.attachments && step.attachments.length > 0) {
        text += `- Attachments: ${step.attachments.length} file(s)
`;
        step.attachments.forEach((att) => {
          text += `  - ${att.filename || att.fileName || "unnamed"}
`;
        });
      }
      if (step.customFields && Object.keys(step.customFields).length > 0) {
        text += `- Custom Fields: ${JSON.stringify(step.customFields)}
`;
      }
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting XRay test steps: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestExecTests.js
var xrayGetTestExecTestsSchema = {
  name: "xray_get_test_exec_tests",
  description: "Get all tests associated with an XRay Test Execution issue, with optional detailed view including test run status",
  inputSchema: {
    type: "object",
    properties: {
      testExecKey: {
        type: "string",
        description: "The JIRA Test Execution issue key (e.g., DPAY-5678)"
      },
      detailed: {
        type: "boolean",
        description: "If true, returns detailed info including test run status (default: false)"
      },
      page: {
        type: "number",
        description: "Page number for pagination (starts at 1)"
      },
      limit: {
        type: "number",
        description: "Number of results per page"
      }
    },
    required: ["testExecKey"]
  }
};
async function handleXrayGetTestExecTests(args) {
  try {
    const { testExecKey, detailed = false, page, limit } = args;
    const apiClient = new JiraApiClient();
    const result = await apiClient.getXrayTestExecTests(testExecKey, detailed, page, limit);
    const tests = Array.isArray(result) ? result : result?.issues || result;
    if (!Array.isArray(tests) || tests.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No tests found in Test Execution ${testExecKey}.`
          }
        ]
      };
    }
    let text = `**Tests in Test Execution ${testExecKey}** (${tests.length} tests)

`;
    tests.forEach((test, index) => {
      text += `**${index + 1}. ${test.key}:** ${test.summary || "(no summary)"}
`;
      text += `   - Status: ${test.status || "Unknown"}
`;
      if (test.assignee)
        text += `   - Assignee: ${test.assignee}
`;
      if (test.type)
        text += `   - Type: ${test.type}
`;
      if (test.defects?.length) {
        text += `   - Defects: ${test.defects.map((d) => d.key || d).join(", ")}
`;
      }
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting test execution tests: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestPlanTests.js
var xrayGetTestPlanTestsSchema = {
  name: "xray_get_test_plan_tests",
  description: "Get all tests associated with an XRay Test Plan issue",
  inputSchema: {
    type: "object",
    properties: {
      testPlanKey: {
        type: "string",
        description: "The JIRA Test Plan issue key (e.g., DPAY-9999)"
      },
      page: {
        type: "number",
        description: "Page number for pagination (starts at 1)"
      },
      limit: {
        type: "number",
        description: "Number of results per page"
      }
    },
    required: ["testPlanKey"]
  }
};
async function handleXrayGetTestPlanTests(args) {
  try {
    const { testPlanKey, page, limit } = args;
    const apiClient = new JiraApiClient();
    const result = await apiClient.getXrayTestPlanTests(testPlanKey, page, limit);
    const tests = Array.isArray(result) ? result : result?.issues || result;
    if (!Array.isArray(tests) || tests.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No tests found in Test Plan ${testPlanKey}.`
          }
        ]
      };
    }
    let text = `**Tests in Test Plan ${testPlanKey}** (${tests.length} tests)

`;
    tests.forEach((test, index) => {
      text += `**${index + 1}. ${test.key}:** ${test.summary || "(no summary)"}
`;
      if (test.status)
        text += `   - Status: ${test.status}
`;
      if (test.type)
        text += `   - Type: ${test.type}
`;
      if (test.assignee)
        text += `   - Assignee: ${test.assignee}
`;
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting test plan tests: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestSetTests.js
var xrayGetTestSetTestsSchema = {
  name: "xray_get_test_set_tests",
  description: "Get all tests associated with an XRay Test Set issue",
  inputSchema: {
    type: "object",
    properties: {
      testSetKey: {
        type: "string",
        description: "The JIRA Test Set issue key (e.g., DPAY-7777)"
      },
      page: {
        type: "number",
        description: "Page number for pagination (starts at 1)"
      },
      limit: {
        type: "number",
        description: "Number of results per page"
      }
    },
    required: ["testSetKey"]
  }
};
async function handleXrayGetTestSetTests(args) {
  try {
    const { testSetKey, page, limit } = args;
    const apiClient = new JiraApiClient();
    const result = await apiClient.getXrayTestSetTests(testSetKey, page, limit);
    const tests = Array.isArray(result) ? result : result?.issues || result;
    if (!Array.isArray(tests) || tests.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No tests found in Test Set ${testSetKey}.`
          }
        ]
      };
    }
    let text = `**Tests in Test Set ${testSetKey}** (${tests.length} tests)

`;
    tests.forEach((test, index) => {
      text += `**${index + 1}. ${test.key}:** ${test.summary || "(no summary)"}
`;
      if (test.status)
        text += `   - Status: ${test.status}
`;
      if (test.type)
        text += `   - Type: ${test.type}
`;
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting test set tests: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestRuns.js
var xrayGetTestRunsSchema = {
  name: "xray_get_test_runs",
  description: "Export XRay test run results. Filter by test execution, test, test plan, or test environment. Returns execution status, defects, and step results.",
  inputSchema: {
    type: "object",
    properties: {
      testExecKey: {
        type: "string",
        description: "Test Execution issue key to filter by (e.g., DPAY-5678)"
      },
      testKey: {
        type: "string",
        description: "Test issue key to filter by (e.g., DPAY-1234)"
      },
      testPlanKey: {
        type: "string",
        description: "Test Plan issue key to filter by (e.g., DPAY-9999)"
      },
      testEnvironments: {
        type: "string",
        description: "Test environment name to filter by (e.g., QA, Staging)"
      },
      page: {
        type: "number",
        description: "Page number for pagination"
      },
      limit: {
        type: "number",
        description: "Number of results per page"
      }
    }
  }
};
async function handleXrayGetTestRuns(args) {
  try {
    const { testExecKey, testKey, testPlanKey, testEnvironments, page, limit } = args;
    if (!testExecKey && !testKey && !testPlanKey) {
      return {
        content: [
          {
            type: "text",
            text: "At least one of testExecKey, testKey, or testPlanKey must be provided."
          }
        ],
        isError: true
      };
    }
    const apiClient = new JiraApiClient();
    const result = await apiClient.getXrayTestRuns(testExecKey, testKey, testPlanKey, testEnvironments, page, limit);
    const runs = Array.isArray(result) ? result : result?.testRuns || result;
    if (!Array.isArray(runs) || runs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No test runs found for the given filters."
          }
        ]
      };
    }
    let text = `**Test Runs** (${runs.length} results)

`;
    runs.forEach((run, index) => {
      text += `**${index + 1}. ${run.testKey || run.key || "Unknown"}**
`;
      text += `   - Status: ${run.status || "Unknown"}
`;
      if (run.testExecKey)
        text += `   - Test Execution: ${run.testExecKey}
`;
      if (run.assignee)
        text += `   - Assignee: ${run.assignee}
`;
      if (run.executedBy)
        text += `   - Executed By: ${run.executedBy}
`;
      if (run.startedOn)
        text += `   - Started: ${run.startedOn}
`;
      if (run.finishedOn)
        text += `   - Finished: ${run.finishedOn}
`;
      if (run.comment)
        text += `   - Comment: ${run.comment}
`;
      if (run.defects?.length) {
        text += `   - Defects: ${run.defects.map((d) => d.key || d).join(", ")}
`;
      }
      if (run.steps?.length) {
        text += `   - Steps (${run.steps.length}):
`;
        run.steps.forEach((step, si) => {
          text += `     ${si + 1}. ${step.status || "Unknown"} \u2014 ${step.comment || "(no comment)"}
`;
        });
      }
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting test runs: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xraySearchTestCases.js
var xraySearchTestCasesSchema = {
  name: "xray_search_test_cases",
  description: "Search for XRay Test Cases using JQL. Automatically adds issuetype=Test filter. Returns test cases with full Jira fields including priority, status, labels, components, assignee, and all custom/XRay fields.",
  inputSchema: {
    type: "object",
    properties: {
      jql: {
        type: "string",
        description: 'JQL query to filter test cases. The issuetype=Test filter is added automatically. Example: "project = DPAY AND status = Open"'
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results (default: 50)"
      },
      startAt: {
        type: "number",
        description: "Starting index for pagination (default: 0)"
      }
    },
    required: ["jql"]
  }
};
async function handleXraySearchTestCases(args) {
  try {
    const { jql, maxResults = 50, startAt = 0 } = args;
    const hasIssueType = /issuetype\s*[=!]/i.test(jql);
    const fullJql = hasIssueType ? jql : `issuetype = Test AND (${jql})`;
    const apiClient = new JiraApiClient();
    const extraFields = [
      "labels",
      "components",
      "fixVersions",
      "reporter",
      "description"
    ];
    const result = await apiClient.searchJiraIssues(fullJql, maxResults, startAt, extraFields);
    const issues = result.issues || [];
    if (issues.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No test cases found for JQL: ${fullJql}`
          }
        ]
      };
    }
    let text = `**XRay Test Cases** (${issues.length} of ${result.total} total)
`;
    text += `JQL: \`${fullJql}\`

`;
    issues.forEach((issue, index) => {
      const f = issue.fields || {};
      text += `**${index + 1}. ${issue.key}: ${f.summary || "(no summary)"}**
`;
      text += `   - Status: ${f.status?.name || "Unknown"}
`;
      text += `   - Priority: ${f.priority?.name || "Unknown"}
`;
      text += `   - Assignee: ${f.assignee?.displayName || "Unassigned"}
`;
      text += `   - Reporter: ${f.reporter?.displayName || "Unknown"}
`;
      if (f.labels?.length)
        text += `   - Labels: ${f.labels.join(", ")}
`;
      if (f.components?.length)
        text += `   - Components: ${f.components.map((c) => c.name).join(", ")}
`;
      if (f.fixVersions?.length)
        text += `   - Fix Versions: ${f.fixVersions.map((v) => v.name).join(", ")}
`;
      text += `   - Created: ${f.created || "Unknown"}
`;
      text += `   - Updated: ${f.updated || "Unknown"}
`;
      text += "\n";
    });
    if (result.total > issues.length) {
      text += `
_Showing ${startAt + 1}-${startAt + issues.length} of ${result.total}. Use startAt=${startAt + maxResults} for next page._
`;
    }
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching test cases: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestStatuses.js
var xrayGetTestStatusesSchema = {
  name: "xray_get_test_statuses",
  description: "Get all available XRay test statuses configured in the JIRA instance. Returns status names, descriptions, and colors for test run results.",
  inputSchema: {
    type: "object",
    properties: {}
  }
};
async function handleXrayGetTestStatuses(args) {
  try {
    const apiClient = new JiraApiClient();
    const statuses = await apiClient.getXrayTestStatuses();
    if (!Array.isArray(statuses) || statuses.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No XRay test statuses found."
          }
        ]
      };
    }
    let text = `**XRay Test Statuses** (${statuses.length})

`;
    statuses.forEach((status, index) => {
      text += `**${index + 1}. ${status.name || "Unknown"}**
`;
      if (status.description)
        text += `   - Description: ${status.description}
`;
      if (status.color)
        text += `   - Color: ${status.color}
`;
      if (status.final !== void 0)
        text += `   - Final: ${status.final}
`;
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting XRay test statuses: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetTestPreConditions.js
var xrayGetTestPreConditionsSchema = {
  name: "xray_get_test_preconditions",
  description: "Get all pre-conditions associated with an XRay Test issue. Returns pre-condition keys, summaries, types, and conditions.",
  inputSchema: {
    type: "object",
    properties: {
      testKey: {
        type: "string",
        description: "The JIRA Test issue key (e.g., DPAY-1234)"
      }
    },
    required: ["testKey"]
  }
};
async function handleXrayGetTestPreConditions(args) {
  try {
    const { testKey } = args;
    const apiClient = new JiraApiClient();
    const preConditions = await apiClient.getXrayTestPreConditions(testKey);
    if (!Array.isArray(preConditions) || preConditions.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No pre-conditions found for ${testKey}.`
          }
        ]
      };
    }
    let text = `**Pre-Conditions for ${testKey}** (${preConditions.length})

`;
    preConditions.forEach((pc, index) => {
      text += `**${index + 1}. ${pc.key}:** ${pc.summary || pc.condition || "(no description)"}
`;
      if (pc.type)
        text += `   - Type: ${pc.type}
`;
      if (pc.condition)
        text += `   - Condition: ${pc.condition}
`;
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting XRay pre-conditions: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/xrayGetPreConditionTests.js
var xrayGetPreConditionTestsSchema = {
  name: "xray_get_precondition_tests",
  description: "Get all tests associated with an XRay Pre-Condition issue. Returns the test keys and summaries linked to a pre-condition.",
  inputSchema: {
    type: "object",
    properties: {
      preConditionKey: {
        type: "string",
        description: "The JIRA Pre-Condition issue key (e.g., DPAY-3333)"
      }
    },
    required: ["preConditionKey"]
  }
};
async function handleXrayGetPreConditionTests(args) {
  try {
    const { preConditionKey } = args;
    const apiClient = new JiraApiClient();
    const tests = await apiClient.getXrayPreConditionTests(preConditionKey);
    if (!Array.isArray(tests) || tests.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No tests found for Pre-Condition ${preConditionKey}.`
          }
        ]
      };
    }
    let text = `**Tests for Pre-Condition ${preConditionKey}** (${tests.length})

`;
    tests.forEach((test, index) => {
      text += `**${index + 1}. ${test.key}:** ${test.summary || "(no summary)"}
`;
      if (test.status)
        text += `   - Status: ${test.status}
`;
      if (test.type)
        text += `   - Type: ${test.type}
`;
      text += "\n";
    });
    return {
      content: [{ type: "text", text }]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting pre-condition tests: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      ],
      isError: true
    };
  }
}

// build/tools/jiraGetDevStatus.js
var jiraGetDevStatusSchema = {
  name: "jira_get_dev_status",
  description: "Get the Development Panel data for a JIRA ticket \u2014 linked pull requests, branches, and commits from GitHub. Server-only (not available on Jira Cloud).",
  inputSchema: {
    type: "object",
    properties: {
      ticketId: {
        type: "string",
        description: "The JIRA ticket ID (e.g., PROJ-123)"
      }
    },
    required: ["ticketId"]
  }
};
async function handleJiraGetDevStatus(args) {
  try {
    const { ticketId } = args;
    const apiClient = new JiraApiClient();
    const ticket = await apiClient.fetchJiraTicket(ticketId, ["summary"]);
    const issueId = ticket.id;
    if (!issueId) {
      return {
        content: [{ type: "text", text: `Could not resolve internal issue ID for ${ticketId}.` }],
        isError: true
      };
    }
    const devStatus = await apiClient.getDevStatus(issueId);
    const lines = [`**Development Status for ${ticketId}** (issue ID: ${issueId})`, ""];
    const detail = devStatus?.detail;
    if (!detail || detail.length === 0) {
      lines.push("No development data found for this ticket.");
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    for (const provider of detail) {
      lines.push(`## ${provider.instanceName || provider.name || "Unknown"}`, "");
      for (const pr of provider.pullRequests || []) {
        const status = pr.status || "UNKNOWN";
        const repo = pr.repositoryName || pr.destination?.repository?.name || "";
        lines.push(`- [${status}] **${pr.name || pr.title || "(no title)"}** (${repo})`);
        if (pr.source?.branch || pr.destination?.branch)
          lines.push(`  Branch: ${pr.source?.branch || ""} \u2192 ${pr.destination?.branch || ""}`);
        if (pr.author?.name || pr.author?.login)
          lines.push(`  Author: ${pr.author?.name || pr.author?.login}`);
        if (pr.url)
          lines.push(`  URL: ${pr.url}`);
        lines.push("");
      }
      for (const branch of provider.branches || []) {
        lines.push(`- **${branch.name || "(unnamed)"}** (${branch.repository?.name || ""})`);
        if (branch.url)
          lines.push(`  URL: ${branch.url}`);
      }
      if (provider.branches?.length)
        lines.push("");
      for (const commit of provider.commits || []) {
        lines.push(`- \`${(commit.id || "").substring(0, 8)}\` ${commit.message || "(no message)"}`);
        if (commit.author?.name)
          lines.push(`  Author: ${commit.author.name}`);
        if (commit.url)
          lines.push(`  URL: ${commit.url}`);
      }
      if (provider.commits?.length)
        lines.push("");
    }
    return { content: [{ type: "text", text: lines.join("\n") }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error fetching dev status: ${error instanceof Error ? error.message : "Unknown error"}` }],
      isError: true
    };
  }
}

// build/tools/jiraGetLinkTypes.js
var jiraGetLinkTypesSchema = {
  name: "jira_get_link_types",
  description: "Get all available issue link types from the JIRA instance (e.g., Test, Blocks, Relates)",
  inputSchema: {
    type: "object",
    properties: {
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the link types data (optional)"
      }
    },
    required: []
  }
};
async function handleJiraGetLinkTypes(args) {
  try {
    const { outputDir } = args;
    const apiClient = new JiraApiClient();
    const data = await apiClient.getJiraIssueLinkTypes();
    const linkTypes = data.issueLinkTypes || [];
    let summaryText = `**Available Issue Link Types**

**Total Link Types:** ${linkTypes.length}

`;
    linkTypes.forEach((lt, index) => {
      summaryText += `**${index + 1}. ${lt.name}**
- Inward: ${lt.inward}
- Outward: ${lt.outward}

`;
    });
    const savedPath = await saveData(outputDir, `link_types_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, { fetchedAt: (/* @__PURE__ */ new Date()).toISOString(), rawData: data, formattedSummary: summaryText }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return { content: [{ type: "text", text: `${summaryText}${savedInfo}` }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error fetching JIRA issue link types: ${error instanceof Error ? error.message : "Unknown error"}` }],
      isError: true
    };
  }
}

// build/tools/jiraGetMyself.js
var jiraGetMyselfSchema = {
  name: "jira_get_myself",
  description: "Get the currently authenticated Jira user's profile (username, display name, email). Useful for resolving the internal username needed for assignee fields.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};
async function handleJiraGetMyself(_args) {
  try {
    const apiClient = new JiraApiClient();
    const user = await apiClient.getMyself();
    const summaryText = `**Current Jira User**

**Username:** ${user.name || user.accountId || "N/A"}
**Display Name:** ${user.displayName}
**Email:** ${user.emailAddress || "Not available"}
**Active:** ${user.active}`;
    return { content: [{ type: "text", text: summaryText }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error fetching current user: ${error instanceof Error ? error.message : "Unknown error"}` }],
      isError: true
    };
  }
}

// build/tools/jiraLinkIssues.js
var jiraLinkIssuesSchema = {
  name: "jira_link_issues",
  description: "Create a directional link between two JIRA issues (e.g., Test, Blocks, Relates)",
  inputSchema: {
    type: "object",
    properties: {
      inwardTicketId: {
        type: "string",
        description: "The ticket key receiving the inward relationship (e.g., PROJ-100)"
      },
      outwardTicketId: {
        type: "string",
        description: "The ticket key receiving the outward relationship (e.g., PROJ-200)"
      },
      linkType: {
        type: "string",
        description: 'The link type name (e.g., "Test", "Blocks", "Relates")'
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description: "Directory to save the link operation result (optional)"
      }
    },
    required: ["inwardTicketId", "outwardTicketId", "linkType"]
  }
};
async function handleJiraLinkIssues(args) {
  try {
    const { inwardTicketId, outwardTicketId, linkType, outputDir } = args;
    const apiClient = new JiraApiClient();
    await apiClient.linkJiraIssues(inwardTicketId, outwardTicketId, linkType);
    const summaryText = `**Issue Link Created Successfully**

**Link Type:** ${linkType}
**Inward Issue:** ${inwardTicketId}
**Outward Issue:** ${outwardTicketId}`;
    const savedPath = await saveData(outputDir, `link_${inwardTicketId}_${outwardTicketId}_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, { inwardTicketId, outwardTicketId, linkType, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, true);
    const savedInfo = savedPath ? `

**Saved to:** ${savedPath}` : "";
    return { content: [{ type: "text", text: `${summaryText}${savedInfo}` }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error linking JIRA issues: ${error instanceof Error ? error.message : "Unknown error"}` }],
      isError: true
    };
  }
}

// build/tools/xrayAddTestsToTestExec.js
var xrayAddTestsToTestExecSchema = {
  name: "xray_add_tests_to_test_exec",
  description: "Add one or more Test issues to an XRay Test Execution. Server-only (XRay REST API).",
  inputSchema: {
    type: "object",
    properties: {
      testExecKey: {
        type: "string",
        description: "The Test Execution issue key (e.g., PROJ-100)"
      },
      testKeys: {
        type: "array",
        items: { type: "string" },
        description: 'Array of Test issue keys to add (e.g., ["PROJ-101", "PROJ-102"])'
      }
    },
    required: ["testExecKey", "testKeys"]
  }
};
async function handleXrayAddTestsToTestExec(args) {
  try {
    const { testExecKey, testKeys: rawTestKeys } = args;
    const testKeys = typeof rawTestKeys === "string" ? JSON.parse(rawTestKeys) : rawTestKeys;
    if (!testKeys || testKeys.length === 0) {
      return { content: [{ type: "text", text: "No test keys provided." }] };
    }
    const apiClient = new JiraApiClient();
    await apiClient.addTestsToTestExec(testExecKey, testKeys);
    return {
      content: [{
        type: "text",
        text: `**Tests Added to Test Execution ${testExecKey}**

Added ${testKeys.length} test(s): ${testKeys.join(", ")}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error adding tests to test execution: ${error.message}` }],
      isError: true
    };
  }
}

// build/index.js
var INSTANCE_PREFIX = process.env.JIRA_INSTANCE_PREFIX || "";
function prefixed(schema) {
  if (!INSTANCE_PREFIX)
    return schema;
  return { ...schema, name: INSTANCE_PREFIX + schema.name };
}
var tools = [
  { schema: prefixed(jiraGetIssueSchema), handler: handleJiraGetIssue },
  { schema: prefixed(jiraUpdateIssueSchema), handler: handleJiraUpdateIssue },
  { schema: prefixed(jiraTransitionIssueSchema), handler: handleJiraTransitionIssue },
  { schema: prefixed(jiraAssignIssueSchema), handler: handleJiraAssignIssue },
  { schema: prefixed(jiraCommentOnIssueSchema), handler: handleJiraCommentOnIssue },
  { schema: prefixed(jiraSearchIssuesSchema), handler: handleJiraSearchIssues },
  { schema: prefixed(jiraCreateIssueSchema), handler: handleJiraCreateIssue },
  { schema: prefixed(jiraGetProjectsSchema), handler: handleJiraGetProjects },
  { schema: prefixed(jiraGetIssueTypesSchema), handler: handleJiraGetIssueTypes },
  { schema: prefixed(jiraGetTransitionsSchema), handler: handleJiraGetTransitions },
  { schema: prefixed(jiraGetBoardsSchema), handler: handleJiraGetBoards },
  { schema: prefixed(jiraGetSprintsSchema), handler: handleJiraGetSprints },
  { schema: prefixed(jiraGetSprintIssuesSchema), handler: handleJiraGetSprintIssues },
  { schema: prefixed(jiraGetAttachmentsSchema), handler: handleJiraGetAttachments },
  { schema: prefixed(jiraGetChildIssuesSchema), handler: handleJiraGetChildIssues },
  // XRay tools
  { schema: prefixed(xrayGetTestCaseFullSchema), handler: handleXrayGetTestCaseFull },
  { schema: prefixed(xrayGetTestStepsSchema), handler: handleXrayGetTestSteps },
  { schema: prefixed(xrayGetTestExecTestsSchema), handler: handleXrayGetTestExecTests },
  { schema: prefixed(xrayGetTestPlanTestsSchema), handler: handleXrayGetTestPlanTests },
  { schema: prefixed(xrayGetTestSetTestsSchema), handler: handleXrayGetTestSetTests },
  { schema: prefixed(xrayGetTestRunsSchema), handler: handleXrayGetTestRuns },
  { schema: prefixed(xraySearchTestCasesSchema), handler: handleXraySearchTestCases },
  { schema: prefixed(xrayGetTestStatusesSchema), handler: handleXrayGetTestStatuses },
  { schema: prefixed(xrayGetTestPreConditionsSchema), handler: handleXrayGetTestPreConditions },
  { schema: prefixed(xrayGetPreConditionTestsSchema), handler: handleXrayGetPreConditionTests },
  // Issue links, user, dev status
  { schema: prefixed(jiraGetDevStatusSchema), handler: handleJiraGetDevStatus },
  { schema: prefixed(jiraGetLinkTypesSchema), handler: handleJiraGetLinkTypes },
  { schema: prefixed(jiraGetMyselfSchema), handler: handleJiraGetMyself },
  { schema: prefixed(jiraLinkIssuesSchema), handler: handleJiraLinkIssues },
  // XRay write
  { schema: prefixed(xrayAddTestsToTestExecSchema), handler: handleXrayAddTestsToTestExec }
];
var JiraMCPServer = class {
  server;
  constructor() {
    this.server = new Server({
      name: "jira-mcp",
      version: "0.1.0"
    }, {
      capabilities: {
        tools: {}
      }
    });
    this.setupToolHandlers();
  }
  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.map((t) => t.schema)
    }));
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const tool = tools.find((t) => t.schema.name === request.params.name);
      if (!tool)
        throw new Error(`Unknown tool: ${request.params.name}`);
      return await tool.handler(request.params.arguments);
    });
  }
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("JIRA MCP server running on stdio");
  }
};
var server = new JiraMCPServer();
server.run().catch(console.error);
