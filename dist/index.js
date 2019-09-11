"use strict";
/**
 * This module provides a way to describe JSON-encodeable data-types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function is_void(t) {
    return t.kind == 'type-basic' && t.sub == 'void';
}
exports.is_void = is_void;
function encoder(s) {
    if (s.version != "0") {
        return { error: "unknown schema version" };
    }
    switch (s.encoding) {
        case "json":
            return (x) => {
                let err = typecheck(x, s.t);
                if (err != "ok") {
                    return err;
                }
                return JSON.stringify(x);
            };
        default:
            return { error: "unknown schema encoding" };
    }
}
exports.encoder = encoder;
function decoder(s) {
    if (s.version != "0") {
        return { error: "unknown schema version" };
    }
    switch (s.encoding) {
        case "json":
            return (data) => {
                let x = undefined;
                try {
                    x = JSON.parse(data);
                }
                catch (e) {
                    return { error: "invalid JSON", data: data };
                }
                let err = typecheck(x, s.t);
                if (err != "ok") {
                    return err;
                }
                return { term: x };
            };
        default:
            return { error: "unknown schema encoding" };
    }
}
exports.decoder = decoder;
/**
 * Check if a Javascript value conforms to the given type
 */
function typecheck(x, t) {
    let check = (ok) => {
        if (ok) {
            return "ok";
        }
        return {
            error: "cannot coerce term into type",
            type: t,
            term: x
        };
    };
    switch (t.kind) {
        case "type-basic": {
            switch (t.sub) {
                case "void": return check(false);
                case "null": return check(x == null);
                case "bool": return check(typeof x == "boolean");
                case "int": return check(typeof x == "number");
                case "float": return check(typeof x == "number");
                case "string": return check(typeof x == "string");
            }
            return check(false);
        }
        case "type-literal": {
            return check(JSON.stringify(x) == JSON.stringify(t.value));
        }
        case "type-union": {
            for (let alt of t.alts) {
                if (typecheck(x, alt)) {
                    return check(true);
                }
            }
            return check(false);
        }
    }
    console.log('please finish the implementation of typecheck');
    return check(true);
}
exports.typecheck = typecheck;
function is_err(x) {
    return (typeof x == 'object') && ('error' in x);
}
exports.is_err = is_err;
function json(t) {
    return {
        version: "0",
        encoding: "json",
        t: t,
        meta: {},
    };
}
exports.json = json;
//# sourceMappingURL=index.js.map