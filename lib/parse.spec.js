const { expect } = require('chai');
const parse = require('./parse');

describe('parse', () => {

  it('should throw if no connection string is provided', () => {
    expect(() => parse()).to.throw(/connectionString/);
  });

  it('should be able to parse a single host', () => {
    const connectionString = parse('mongo://localhost');
    expect(connectionString.hosts).to.eql([ { host: 'localhost', port: null }]);
  });

  it('should be able to parse multiple hosts', () => {
    const connectionString = parse('mongo://host1,host2:27017,host3');
    expect(connectionString.hosts[0]).to.eql({ host: 'host1', port: null });
    expect(connectionString.hosts[1]).to.eql({ host: 'host2', port: 27017 });
    expect(connectionString.hosts[2]).to.eql({ host: 'host3', port: null });
  });

  it('should be able to parse a username and password', () => {
    const connectionString = parse('mongo://username:password@host1,host2:27017,host3');
    expect(connectionString.username).to.equal('username');
    expect(connectionString.password).to.equal('password');
  });

  it('should be able to parse a username and password which contains an ampersand', () => {
    const connectionString = parse('mongo://username:p@ssword@host1,host2:27017,host3');
    expect(connectionString.username).to.equal('username');
    expect(connectionString.password).to.equal('p@ssword');
  });

  it('should be able to parse an url encoded username and password', () => {
    const connectionString = parse('mongodb://%40dmin:P%40ssword%3C%3E%2F@host1,host2:2700/db?w=majority');
    expect(connectionString.username).to.equal('@dmin');
    expect(connectionString.password).to.equal('P@ssword<>/');
  });

  it('should support connection strings without a database', () => {
    const connectionString = parse('mongo://username:p@ssword@host1,host2:27017,host3');
    expect(connectionString.database).to.equal(null);
  });

  it('should be able to parse a specified database', () => {
    const connectionString = parse('mongo://username:p@ssword@host1,host2:27017,host3/database');
    expect(connectionString.database).to.equal('database');
  });

  it('should be able to parse a specified database if options are provided', () => {
    const connectionString = parse('mongo://username:p@ssword@host1,host2:27017,host3/database?wtimeoutMS=800');
    expect(connectionString.database).to.equal('database');
  });

  it('should be able to parse connection string options if no database is provided', () => {
    const connectionString = parse('mongo://username:p@ssword@host1,host2:27017,host3?w=majority&readPreference=secondary');
    expect(connectionString.options).to.eql({
      w: 'majority',
      readPreference: 'secondary'
    });
  });

  it('should be able to parse connection string options if a database is provided', () => {
    const connectionString = parse('mongo://username:p@ssword@host1,host2:27017,host3/database?wtimeoutMS=1000&w=majority&readPreference=secondary');
    expect(connectionString.options).to.eql({
      wtimeoutMS: '1000',
      w: 'majority',
      readPreference: 'secondary'
    });
  });

  //  These cases make me a little nervous. I'm trying to make the code useful,
  //  letting people provide unencoded text, but it leads to a few edge cases...
  describe('uri-encoding', () => {
    it('should be able to handle non-uri encoded input which contains an % symbol', () => {
      //  Yikes - we have a percent sign here. URIs are going to get upset...
      const input = 'mongodb://admin:p%ssword@localhost:27017';
      expect(parse(input)).to.eql({
        protocol: 'mongodb://',
        username: 'admin',
        password: 'p%ssword',
        hosts: [ { host: 'localhost', port: 27017 } ],
        database: null,
        options: {}
      });
    });

    it('should be able to handle uri encoded input', () => {
      //  What should happen here? Is the password 'p@ssword' or ACTUALLY
      //  'p%40ssword'? The code assumes the former, but it it could conceivably
      //  be the latter. If that seems to be a valid case, we might need a
      //  'strict' option where we are saying 'input strings are NOT URI encoded,
      //  don't mess with them' or something.
      const input = 'mongodb://admin:p%40ssword@localhost:27017';
      expect(parse(input)).to.eql({
        protocol: 'mongodb://',
        username: 'admin',
        password: 'p@ssword',
        hosts: [ { host: 'localhost', port: 27017 } ],
        database: null,
        options: {}
      });
    });
  });
});
