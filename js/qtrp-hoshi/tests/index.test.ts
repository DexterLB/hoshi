import { expect } from 'chai';
import * as hoshi from '../src';
import { writeFile } from 'fs';

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
    debugger;
    let result = hoshi.typecheck(hoshi.type_as_data(hoshi.typeType), hoshi.typeType)
    if (result != "ok") {
      writeFile("/tmp/typeerr.json", JSON.stringify(result), () => {
        console.log("dumped type error into /tmp/typeerr.json")
      })
    }
    expect(result).to.be.equal("ok")
  })
})
