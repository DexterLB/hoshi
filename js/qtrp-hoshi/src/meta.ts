import {
    Schema, Type,
    TBasic, TLet,
    TVoid, TNull, TBool, TInt, TFloat, TString,
    Data, DataList, DataMap,
    Bindings, MetaData
} from './types'

import {
    tliteral, tstring, tunion, tstruct, tmaybe, tref, tmap, tlist, tlet,
    tbool, tint, tnull, tfloat, is_map, is_list, json
} from './sugar'

export const dataType = tlet(
    {
        "data": tunion([
            tstring(),
            tfloat(),
            tint(),
            tbool(),
            tnull(),
            tmap(tstring(), tref("data")),
            tlist(tref("data")),
        ])
    },
    tref("data"),
)

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

        "data": dataType.bindings['data'],
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
