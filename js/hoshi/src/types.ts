/**
 * This module provides a way to describe JSON-encodeable data-types.
 */


/**
 * `Schema` represents a single encoded data format. This is the main concept
 * of this module.
 */
export interface Schema {
    t: Type,
    version: Version,
    encoding: Encoding,
    meta: MetaData,
}

export type Version = "0"
export type Encoding = "json" // currently "json" is the only valid encoding

/**
 * Any representable type
 */
export type Type = TBasic | TLiteral | TUnion | TStruct | TMap

/**
 * Any basic type
 */
type TBasic = TVoid | TNull | TBool | TInt | TFloat | TString

interface TVoid   { kind: "type-basic", sub: "void",   meta?: MetaData }
interface TNull   { kind: "type-basic", sub: "null",   meta?: MetaData }
interface TBool   { kind: "type-basic", sub: "bool",   meta?: MetaData }
interface TInt    { kind: "type-basic", sub: "int",    meta?: MetaData }
interface TFloat  { kind: "type-basic", sub: "float",  meta?: MetaData }
interface TString { kind: "type-basic", sub: "string", meta?: MetaData }

/**
 * A "literal" type - its only inhabitant is the given value.
 */
interface TLiteral {
    kind: "type-literal",
    value: any,
    meta?: MetaData,
}

/**
 * A value is of the union type if it is of any of the `alts` types.
 */
interface TUnion {
    kind: "type-union",
    alts: Type[],
    meta?: MetaData,
}

/**
 * The Map type represents a dictionary whose keys have the `key` type
 * and whose values have the `value` type.
 *
 * In type/javascript non-string keys should be represented as JSON.
 */
interface TMap {
    kind: "type-map",
    key: Type,
    value: Type,
    meta?: MetaData,
}

/**
 * The List type represents a list of values that have the `value` type.
 */
interface TList {
    kind: "type-list",
    value: Type,
    meta?: MetaData,
}

/**
 * The Struct type represents a Struct with a fixed set of subd fields.
 */
interface TStruct {
    kind: "type-struct",
    fields: StructFields,
    meta?: MetaData,
}

/**
 * The Tuple type represents a tuple with a fixed set of fields.
 * Fields are identified only by their order, as opposed to [[Struct]],
 * where they are identified by sub.
 */
interface TTuple {
    kind: "type-tuple",
    fields: TupleFields,
    meta?: MetaData,
}

interface TupleFields {
    [idx: number]: Type;
}

interface StructFields {
    [key: string]: Type;
}

/**
 * `MetaData` is a key-value dictionary of additional data that may be attached
 * to a type. For example, metadata may contain min/max values for a numeric
 * type, UI hints etc.
 */
type MetaData = Data

/**
 * `Data` represents any JSON-like data structure
 */
type Data = number | string | boolean | null | DataMap | Array<Data>

interface DataMap {
    [key: string]: Data
}

export function is_void(t: Type): t is TVoid {
    return t.kind == 'type-basic' && t.sub == 'void'
}

export function encode(x: Data, s: Schema): string | TypeError {
    let err = (text: string) => {
        term: x,
        type: s.t,
        error: text,
    }

    if s.version != "0" {
        return err("unknown schema version");
    }

    switch(s.encoding) {
        case "json":
            let err = typecheck(x, s.t)
            if err != "ok" {
                return err
            }
            return JSON.stringify(x);
        default:
            return err("unknown schema encoding");
    }
}

export function decode(data: string, s: Schema): { term: Data } | TypeError {
    let err = (text: string) => {
        data: data,
        type: s.t,
        error: text,
    }

    if s.version != "0" {
        return err("unknown schema version");
    }

    switch(s.encoding) {
        case "json":
            let x = JSON.parse(data)
            let err = typecheck(x, s.t)
            if err != "ok" {
                return err
            }
            return JSON.stringify(x);
        default:
            return err("unknown schema encoding");
    }
}

/**
 * Check if a Javascript value conforms to the given type
 */
export function typecheck(x: Data, t: Type): Ok | TypeError {
    let check = (ok: boolean) => {
        if ok {
            return "ok"
        }
        return {
            error: "cannot coerce term into type",
            type: t
        }
    }

    switch(t.kind) {
        case "type-basic": {
            switch(t.sub) {
                case "void":   return check(false);
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
            for (let alt of t.alts) {
                if (typecheck(x, alt)) {
                    return check(true);
                }
            }
            return check(false);
        }
    }
    console.log('please finish the implementation of typecheck')
    return check(true)
}

type Ok = "ok"

export interface TypeError {
    error: string
    type: Type
    term: Data | null
}
