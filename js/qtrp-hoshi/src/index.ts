/**
 * This module provides a way to describe JSON-encodeable data-types.
 */

import {
    Schema, Type,
    TBasic, TLet,
    TVoid, TNull, TBool, TInt, TFloat, TString,
    Data, DataList, DataMap,
    Bindings, MetaData
} from './types'

import {
    tliteral, tstring, tunion, tstruct, tmaybe, tref, tmap, tlist, tlet,
    tbool, tint, tnull, tfloat
} from './sugar'

export * from './types'
export * from './sugar'

export function is_void(t: Type): t is TVoid {
    return t.kind == 'type-basic' && t.sub == 'void'
}

export type Encoder = (x: Data) => string | TypeErr

export function encoder(s: Schema): Encoder | Err {
    if (s.version != "0") {
        return { error: "unknown schema version" };
    }

    switch(s.encoding) {
        case "json":
            return (x: Data) => {
                let err = typecheck(x, s.t)
                if (err != "ok") {
                    return err
                }
                return JSON.stringify(x);
            }
        default:
            return { error: "unknown schema encoding" };
    }
}

export type Decoder = (data: string) => { term: Data } | TypeErr | DecodeErr

/*
 * Create a decoder which decodes data conforming to the given schema
 * into javascript values
 */
export function decoder(s: Schema): Decoder | Err  {
    if (s.version != "0") {
        return { error: "unknown schema version" };
    }

    switch(s.encoding) {
        case "json":
            return (data: string) => {
                let x = undefined
                try {
                    x = JSON.parse(data)
                } catch(e) {
                    return { error: "invalid JSON", data: data }
                }

                let err = typecheck(x, s.t)
                if (err != "ok") {
                    return err
                }
                return { term: x }
            }
        default:
            return { error: "unknown schema encoding" };
    }
}

/**
 * Check if a Javascript value conforms to the given type
 */
export function typecheck(x: Data | undefined, t: Type, bindings?: Bindings): Ok | TypeErr {
    if (bindings == undefined) {
        bindings = {}
    }

    let check = (ok: boolean) => {
        if (ok) {
            return "ok"
        }
        return {
            error: "cannot coerce term into type",
            type: t,
            term: x
        }
    }

    switch(t.kind) {
        case "type-let": {
            return typecheck(x, t.t, { ...bindings, ...t.bindings })
        }
        case "type-ref": {
            if (!(t.name in bindings)) {
                return {
                    error: "unknown ref",
                    ref_name: t.name,
                    bindings: bindings,
                }
            }
            return typecheck(x, bindings[t.name], bindings)
        }
        case "type-basic": {
            switch(t.sub) {
                case "void":   return check(x == undefined);
                case "null":   return check(x == null);
                case "bool":   return check(typeof x == "boolean");
                case "int":    return check(typeof x == "number");
                case "float":  return check(typeof x == "number");
                case "string": return check(typeof x == "string");
            }
            return check(false);
        }
        case "type-literal": {
            return check(JSON.stringify(x) == JSON.stringify(t.value));
        }
        case "type-union": {
            let chain: Array<TypeErr> = []
            for (let alt of t.alts) {
                let result = typecheck(x, alt, bindings)
                if (result == 'ok') {
                    return check(true);
                }
                chain.push(result)
            }
            return {
                error: "value does not match any alt in union type",
                type: t,
                term: x,
                chain: chain,
            }
        }
        case "type-struct": {
            if (!is_map(x)) {
                return check(false)
            }

            for (let key of Object.keys(t.fields)) {
                let result = typecheck(x[key], t.fields[key], bindings)
                if (result != 'ok') {
                    return result
                }
            }
            return check(true)
        }
        case "type-map": {
            if (!is_map(x)) {
                return check(false)
            }

            for (let key of Object.keys(x)) {
                let key_result = typecheck(key, t.key, bindings)
                if (key_result != 'ok') {
                    return key_result
                }

                let value_result = typecheck(x[key], t.value, bindings)
                if (value_result != 'ok') {
                    return value_result
                }
            }
            return check(true)
        }
        case "type-list": {
            if (!is_list(x)) {
                return check(false)
            }

            let y = x as Array<Data>  // fixme: bug in typescript?

            for (let i = 0; i < y.length; i++) {
                let result = typecheck(y[i], t.value, bindings)
                if (result != 'ok') {
                    return result
                }
            }
            return check(true)
        }
    }
    console.log('fixme: unknown kind', t.kind)
    return check(false)
}

// TODO: document those

type Ok = "ok"

export interface Err {
    error: string
}

export interface DecodeErr extends Err {
    data: string
}

export type TypeErr = CoerceErr | RefErr

export interface CoerceErr extends Err {
    type: Type
    chain?: Array<TypeErr>
    term: Data | null | undefined
}

export interface RefErr extends Err {
    ref_name: string,
    bindings: Bindings,
}

export function json(t: Type, meta?: MetaData): Schema {
    if (!meta) {
        meta = {}
    }
    return {
        version: "0",
        encoding: "json",
        t: t,
        meta: meta,
    }
}

export const dataType = tunion([
    tstring(),
    tfloat(),
    tint(),
    tbool(),
    tnull(),
    tmap(tstring(), tref("data")),
    tlist(tref("data")),
])

export const typeType: TLet = tlet(
    {
        "type": tunion([
            tref("basic"),
            tref("literal"),
            tref("union"),
            tref("struct"),
            tref("map"),
            tref("list"),
            tref("tuple"),
            tref("let"),
            tref("ref"),
        ]),
        "basic": tstruct({
            kind: tliteral("type-basic"),
            sub: tunion([
                tliteral("void"),
                tliteral("null"),
                tliteral("bool"),
                tliteral("int"),
                tliteral("float"),
                tliteral("string"),
            ]),
            meta: tref("maybe-data"),
        }),
        "literal": tstruct({
            kind: tliteral("type-literal"),
            value: tref("data"),
            meta: tref("maybe-data"),
        }),
        "union": tstruct({
            kind: tliteral("type-union"),
            alts: tlist(tref("type")),
            meta: tref("maybe-data"),
        }),
        "struct": tstruct({
            kind: tliteral("type-struct"),
            fields: tmap(tstring(), tref("type")),
            meta: tref("maybe-data"),
        }),
        "tuple": tstruct({
            kind: tliteral("type-tuple"),
            fields: tlist(tref("type")),
            meta: tref("maybe-data"),
        }),
        "map": tstruct({
            kind: tliteral("type-map"),
            key: tref("type"),
            value: tref("type"),
            meta: tref("maybe-data"),
        }),
        "list": tstruct({
            kind: tliteral("type-list"),
            value: tref("type"),
            meta: tref("maybe-data"),
        }),
        "let": tstruct({
            bindings: tmap(tstring(), tref("type")),
            t: tref("type"),
            meta: tref("maybe-data"),
        }),
        "ref": tstruct({
            name: tstring(),
            meta: tref("maybe-data"),
        }),

        "maybe-data": tmaybe(tref("data")),

        "data": dataType,
    },
    tref("type"),
)

export const schemaType: Type = tstruct({
    t: typeType,
    version: tunion([tliteral("0")]),
    encoding: tunion([tliteral("json")]),
    meta: dataType,
})

export function jsonSchema(meta?: MetaData): Schema {
    return json(schemaType, meta)
}


export function type_as_data(t: Type): Data {
    return (t as unknown) as Data // fixme
}

export function is_err(x: any): x is Err {
    return (typeof x == 'object') && ('error' in x)
}

function is_map(x: any): x is DataMap {
    return (typeof x == 'object') && (x != null)
}

function is_list(x: any): x is DataList {
    return (x instanceof Array) && (x != null)
}

function voidable(t: Type, bindings: Bindings): boolean {
    return typecheck(undefined, t, bindings) == 'ok'
}
