/**
 * This module provides a way to describe JSON-encodeable data-types.
 */

export interface Schema {
    t: Type,
    meta: SchemaMetaData,
}


export type Version = string
export type Encoding = "json"

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
 * MetaData is a key-value dictionary of additional data that may be attached
 * to a type. For example, metadata may contain min/max values for a numeric
 * type, UI hints etc.
 */
interface MetaData {
    [key: string]: number | string | boolean | null | MetaData
}

interface SchemaMetaData extends MetaData {
    version: Version,
    encoding: Encoding,
}

export function is_void(t: Type): t is TVoid {
    return t.kind == 'type-basic' && t.sub == 'void'
}

/**
 * Check if a Javascript value conforms to the given type
 */
export function typecheck(x: any, t: Type): boolean {
    switch(t.kind) {
        case "type-basic": {
            switch(t.sub) {
                case "void":   return false;
                case "null":   return (x == null);
                case "bool":   return (typeof x == "boolean");
                case "int":    return (typeof x == "number");
                case "float":  return (typeof x == "number");
                case "string": return (typeof x == "string");
            }
            return false;
        }
        case "type-literal": {
            return JSON.stringify(x) == JSON.stringify(t.value);
        }
        case "type-union": {
            for (let alt of t.alts) {
                if (typecheck(x, alt)) {
                    return true;
                }
            }
            return false;
        }
    }
    console.log('please finish the implementation of typecheck')
    return true
}
