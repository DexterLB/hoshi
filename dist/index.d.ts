/**
 * This module provides a way to describe JSON-encodeable data-types.
 */
/**
 * `Schema` represents a single encoded data format. This is the main concept
 * of this module.
 */
export interface Schema {
    t: Type;
    version: Version;
    encoding: Encoding;
    meta: MetaData;
}
export declare type Version = "0";
export declare type Encoding = "json";
/**
 * Any representable type
 */
export declare type Type = TBasic | TLiteral | TUnion | TStruct | TMap;
/**
 * Any basic type
 */
declare type TBasic = TVoid | TNull | TBool | TInt | TFloat | TString;
interface TVoid {
    kind: "type-basic";
    sub: "void";
    meta?: MetaData;
}
interface TNull {
    kind: "type-basic";
    sub: "null";
    meta?: MetaData;
}
interface TBool {
    kind: "type-basic";
    sub: "bool";
    meta?: MetaData;
}
interface TInt {
    kind: "type-basic";
    sub: "int";
    meta?: MetaData;
}
interface TFloat {
    kind: "type-basic";
    sub: "float";
    meta?: MetaData;
}
interface TString {
    kind: "type-basic";
    sub: "string";
    meta?: MetaData;
}
/**
 * A "literal" type - its only inhabitant is the given value.
 */
interface TLiteral {
    kind: "type-literal";
    value: any;
    meta?: MetaData;
}
/**
 * A value is of the union type if it is of any of the `alts` types.
 */
interface TUnion {
    kind: "type-union";
    alts: Type[];
    meta?: MetaData;
}
/**
 * The Map type represents a dictionary whose keys have the `key` type
 * and whose values have the `value` type.
 *
 * In type/javascript non-string keys should be represented as JSON.
 */
interface TMap {
    kind: "type-map";
    key: Type;
    value: Type;
    meta?: MetaData;
}
/**
 * The Struct type represents a Struct with a fixed set of subd fields.
 */
interface TStruct {
    kind: "type-struct";
    fields: StructFields;
    meta?: MetaData;
}
interface StructFields {
    [key: string]: Type;
}
/**
 * `MetaData` is a key-value dictionary of additional data that may be attached
 * to a type. For example, metadata may contain min/max values for a numeric
 * type, UI hints etc.
 */
declare type MetaData = Data;
/**
 * `Data` represents any JSON-like data structure
 */
export declare type Data = number | string | boolean | null | DataMap | DataList;
interface DataMap {
    [key: string]: Data;
}
interface DataList {
    [idx: number]: Data;
}
export declare function is_void(t: Type): t is TVoid;
export declare type Encoder = (x: Data) => string | TypeErr;
export declare function encoder(s: Schema): Encoder | Err;
export declare type Decoder = (data: string) => {
    term: Data;
} | TypeErr | DecodeErr;
export declare function decoder(s: Schema): Decoder | Err;
/**
 * Check if a Javascript value conforms to the given type
 */
export declare function typecheck(x: Data, t: Type): Ok | TypeErr;
declare type Ok = "ok";
export interface Err {
    error: string;
}
export interface DecodeErr extends Err {
    data: string;
}
export interface TypeErr extends Err {
    type: Type;
    term: Data | null;
}
export declare function is_err(x: any): x is Err;
export declare function json(t: Type): Schema;
export {};
