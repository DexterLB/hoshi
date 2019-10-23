/**
 * This module provides a way to describe JSON-encodeable data-types.
 */

// -------- sugar functions ---------

export function tvoid(meta?: MetaData): TVoid {
    return metify<TVoid>(
        { kind: "type-basic", sub: "void" },
        meta,
    )
}

export function tnull(meta?: MetaData): TNull {
    return metify<TNull>(
        { kind: "type-basic", sub: "null" },
        meta,
    )
}

export function tbool(meta?: MetaData): TBool {
    return metify<TBool>(
        { kind: "type-basic", sub: "bool" },
        meta,
    )
}

export function tint(meta?: MetaData): TInt {
    return metify<TInt>(
        { kind: "type-basic", sub: "int" },
        meta,
    )
}

export function tfloat(meta?: MetaData): TFloat {
    return metify<TFloat>(
        { kind: "type-basic", sub: "float" },
        meta,
    )
}

export function tstring(meta?: MetaData): TString {
    return metify<TString>(
        { kind: "type-basic", sub: "string" },
        meta,
    )
}

export function ttuple(fields: TupleFields, meta?: MetaData): TTuple {
    return metify<TTuple>(
        { kind: "type-tuple", fields: fields },
        meta,
    )
}

export function tstruct(fields: StructFields, meta?: MetaData): TStruct {
    return metify<TStruct>(
        { kind: "type-struct", fields: fields },
        meta,
    )
}

export function tliteral(value: Data, meta?: MetaData): TLiteral {
    return metify<TLiteral>(
        { kind: "type-literal", value: value },
        meta,
    )
}

export function tunion(alts: Array<Type>, meta?: MetaData): TUnion {
    return metify<TUnion>(
        { kind: "type-union", alts: alts },
        meta,
    )
}

export function tmap(key: Type, value: Type, meta?: MetaData): TMap {
    return metify<TMap>(
        { kind: "type-map", key: key, value: value },
        meta,
    )
}

export function tlist(value: Type, meta?: MetaData): TList {
    return metify<TList>(
        { kind: "type-list", value: value },
        meta,
    )
}

export function tlet(bindings: Bindings, t: Type, meta?: MetaData): TLet {
    return metify<TLet>(
        { kind: "type-let", bindings: bindings, t: t },
        meta,
    )
}

export function tref(name: string, meta?: MetaData): TRef {
    return metify<TRef>(
        { kind: "type-ref", name: name },
        meta,
    )
}

function metify<T extends MaybeHasMeta>(x: T, m: MetaData | undefined): T {
    if (m != undefined) {
        x.meta = m
    }
    return x
}

interface MaybeHasMeta {
    meta?: MetaData
}

// -------- type definitions ---------

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
    value: Data,
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
 * The Struct type represents a Struct with a fixed set of fields.
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

interface TLet {
    kind: "type-let",
    bindings: Bindings,
    t: Type,
    meta?: MetaData,
}

interface Bindings {
    [key: string]: Type;
}

interface TRef {
    kind: "type-ref",
    name: string,
    meta?: MetaData,
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
export type Data = number | string | boolean | null | DataMap | DataList

interface DataMap {
    [key: string]: Data
}

interface DataList {
    [idx: number]: Data
}

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
export function typecheck(x: Data, t: Type, bindings?: Bindings): Ok | TypeErr {
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

    console.log('typecheck ', x, ' as ', t)
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
                if (typecheck(x, alt, bindings) == 'ok') {
                    return check(true);
                }
            }
            return check(false);
        }
    }
    console.log('fixme: unknown kind', t.kind)
    return check(false)
}

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
    term: Data | null
}

export interface RefErr extends Err {
    ref_name: string,
    bindings: Bindings,
}

export function is_err(x: any): x is Err {
    return (typeof x == 'object') && ('error' in x)
}

export function json(t: Type): Schema {
    return {
        version: "0",
        encoding: "json",
        t: t,
        meta: {},
    }
}

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

        "maybe-data": tunion([tref("data"), tvoid()]),
    },
    tref("type"),
)

export function type_as_data(t: Type): Data {
    return (t as unknown) as Data // fixme
}
