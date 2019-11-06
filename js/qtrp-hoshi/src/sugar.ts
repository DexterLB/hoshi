import {
    Schema, Type,
    TBasic, TLet,
    TVoid, TNull, TBool, TInt, TFloat, TString,
    TTuple, TStruct, TMap, TList, TLiteral, TUnion, TRef,
    TupleFields, StructFields,
    Data, DataList, DataMap,
    Bindings, MetaData
} from './types'

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

export function tmaybe(t: Type): Type {
    return tunion([t, tvoid()])
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

