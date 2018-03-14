const { expect } = require('chai');
const index = require('./index');

describe('index', () => {
  it('should export a parse function', () => {
    expect(index.parse).to.be.a('function');
  });

  it('should export a ConnectionString class', () => {
    expect(index.ConnectionString).to.be.a('function');
  });
});
