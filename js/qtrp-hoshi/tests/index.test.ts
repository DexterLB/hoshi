import { expect } from 'chai';
import * as hoshi from '../src';
const fs = eval('require("fs")');

describe('universe', () => {
  it('works', () => {
    let result = 6 * 7
    expect(result).equal(42)
  })
});

describe('typeCheck', () => {
  it('fails on union with 2 failing alts', () => {
    let result = hoshi.typecheck(
      42,
      hoshi.tunion([
        hoshi.tliteral(56),
        hoshi.tstring(),
      ]),
    )

    expect(result).to.not.be.equal("ok")
  })
})

describe('typeType', () => {
  it('describes itself', () => {
    let result = hoshi.typecheck(hoshi.type_as_data(hoshi.typeType), hoshi.typeType)
    if (result != "ok") {
      fs.writeFile("/tmp/typeerr.json", JSON.stringify(result), () => {
        console.log("dumped type error into /tmp/typeerr.json")
      })
    }
    expect(result).to.be.equal("ok")
  })
})

describe('jsonSchema', () => {
  it('transcodes itself', () => {
    let decoder = hoshi.decoder(hoshi.jsonSchema())
    if ('error' in decoder) {
      expect(decoder).to.be.equal("<decoder>")
      return
    }

    let encoder = hoshi.encoder(hoshi.jsonSchema())
    if ('error' in encoder) {
      expect(encoder).to.be.equal("<encoder>")
      return
    }

    let data = encoder(hoshi.jsonSchema() as unknown as hoshi.Data)
    if (typeof(data) != 'string') {
      fs.writeFile("/tmp/encodeerr.json", JSON.stringify(data), () => {
        console.log("dumped encode error into /tmp/encodeerr.json")
      })
      expect(data).to.be.equal("<data>")
      return
    }

    let result = decoder(data)
    if ('error' in result) {
      fs.writeFile("/tmp/typeerr.json", JSON.stringify(result), () => {
        console.log("dumped type error into /tmp/typeerr.json")
      })
    }
    expect(JSON.stringify(result)).to.be.equal(JSON.stringify({ term: hoshi.jsonSchema() }))
  })
})
