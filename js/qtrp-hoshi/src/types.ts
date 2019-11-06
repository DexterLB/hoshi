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
export type Type = TBasic | TLiteral | TUnion | TStruct | TMap | TList | TTuple | TLet | TRef

/**
 * Any basic type
 */
export type TBasic = TVoid | TNull | TBool | TInt | TFloat | TString

export interface TVoid   { kind: "type-basic", sub: "void",   meta?: MetaData }
export interface TNull   { kind: "type-basic", sub: "null",   meta?: MetaData }
export interface TBool   { kind: "type-basic", sub: "bool",   meta?: MetaData }
export interface TInt    { kind: "type-basic", sub: "int",    meta?: MetaData }
export interface TFloat  { kind: "type-basic", sub: "float",  meta?: MetaData }
export interface TString { kind: "type-basic", sub: "string", meta?: MetaData }

/**
 * A "literal" type - its only inhabitant is the given value.
 */
export interface TLiteral {
    kind: "type-literal",
    value: Data,
    meta?: MetaData,
}

/**
 * A value is of the union type if it is of any of the `alts` types.
 */
export interface TUnion {
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
export interface TMap {
    kind: "type-map",
    key: Type,
    value: Type,
    meta?: MetaData,
}

/**
 * The List type represents a list of values that have the `value` type.
 */
export interface TList {
    kind: "type-list",
    value: Type,
    meta?: MetaData,
}

/**
 * The Struct type represents a Struct with a fixed set of fields.
 */
export interface TStruct {
    kind: "type-struct",
    fields: StructFields,
    meta?: MetaData,
}

/**
 * The Tuple type represents a tuple with a fixed set of fields.
 * Fields are identified only by their order, as opposed to [[Struct]],
 * where they are identified by sub.
 */
export interface TTuple {
    kind: "type-tuple",
    fields: TupleFields,
    meta?: MetaData,
}

export interface TupleFields {
    [idx: number]: Type;
}

export interface StructFields {
    [key: string]: Type;
}

export interface TLet {
    kind: "type-let",
    bindings: Bindings,
    t: Type,
    meta?: MetaData,
}

export interface Bindings {
    [key: string]: Type;
}

export interface TRef {
    kind: "type-ref",
    name: string,
    meta?: MetaData,
}

/**
 * `MetaData` is a key-value dictionary of additional data that may be attached
 * to a type. For example, metadata may contain min/max values for a numeric
 * type, UI hints etc.
 */
export type MetaData = Data

/**
 * `Data` represents any JSON-like data structure
 */
export type Data = number | string | boolean | null | DataMap | DataList

export interface DataMap {
    [key: string]: Data
}

export interface DataList {
    [idx: number]: Data
}
