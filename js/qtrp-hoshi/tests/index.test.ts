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
    expect(hoshi.typecheck(hoshi.type_as_data(hoshi.typeType), hoshi.typeType)).to.be.equal("ok")
  });
})
