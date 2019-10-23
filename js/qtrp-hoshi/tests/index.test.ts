import { expect } from 'chai';
import * as hoshi from '../src';

describe('universe', () => {
  it('works', () => {
    let result = 6 * 7
    expect(result).equal(42)
  });
});

describe('typeType', () => {
  it('describes itself', () => {
    let result = hoshi.typecheck(hoshi.type_as_data(hoshi.typeType), hoshi.typeType)
    if (result != "ok") {
      console.log(result)
    }
    expect(result).to.be.equal("ok")
  });
})
