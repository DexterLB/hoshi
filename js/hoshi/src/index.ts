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
type Data = number | string | boolean | null | DataMap | DataList

interface DataMap {
    [key: string]: Data
}

interface DataList {
    [idx: number]: Data
}

export function is_void(t: Type): t is TVoid {
    return t.kind == 'type-basic' && t.sub == 'void'
}

type Encoder = (x: Data) => string | TypeError

export function encode(s: Schema): Encoder | Error {
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

type Decoder = (data: string) => { term: Data } | TypeError | DecodeError

export function decode(s: Schema): Decoder | Error  {
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
export function typecheck(x: Data, t: Type): Ok | TypeError {
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

export interface Error {
    error: string
}

export interface DecodeError extends Error {
    data: string
}

export interface TypeError extends Error {
    type: Type
    term: Data | null
}
