const { expect } = require('chai');
const ConnectionString = require('./connection-string');

describe('connection-string', () => {
  describe('constructor(object)', () => {
    it('should expect params to be provided', () => {
      expect(() => new ConnectionString()).to.throw(/params/);
    });

    it('should expect a host to be provided', () => {
      expect(() => new ConnectionString({ })).to.throw(/hosts/);
    });

    it('should expect a password if a username is provided', () => {
      const params = {
        hosts: [{ host: 'localhost' }],
        username: 'dave'
      };
      expect(() => new ConnectionString(params)).to.throw(/password/);
    });

    it('should expect a username if a password is provided', () => {
      const params = {
        hosts: [{ host: 'localhost' }],
        password: 'password'
      };
      expect(() => new ConnectionString(params)).to.throw(/password/);
    });
  });

  describe('constructor(string)', () => {
    //  This is really just shorthand for 'new ConnectionString(parse(val))' but
    //  good to test the logic which identifies the construtor parametter is a
    //  a string.
    it('should be able to construct a ConnectionString from a string', () => {
      const input = 'mongodb://admin:p@ssw0rd@localhost:27017';
      const expectedOutput = 'mongodb://admin:p%40ssw0rd@localhost:27017';
      const cn = new ConnectionString(input);
      expect(cn.toURI()).to.equal(expectedOutput);
    });
  });

  describe('toURI', () => {
    it('should correctly write a host and assume mongodb:// is the protocol', () => {
      const params = {
        hosts: [{ host: 'localhost' }]
      };
      expect(new ConnectionString(params).toURI())
        .to.eql('mongodb://localhost');
    });

    it('should correctly write a set of hosts and assume mongodb:// is the protocol', () => {
      const params = {
        hosts: [{ host: 'host1' }, { host: 'host2', port: 27017 }]
      };
      expect(new ConnectionString(params).toURI())
        .to.eql('mongodb://host1,host2:27017');
    });

    it('should correctly write a set of hosts and a protocol', () => {
      const params = {
        protocol: 'mongodb+srv://',
        hosts: [{ host: 'host1' }]
      };
      expect(new ConnectionString(params).toURI())
        .to.eql('mongodb+srv://host1');
    });

    it('should correctly write a set of hosts and options', () => {
      const params = {
        hosts: [{ host: 'host1' }],
        options: { w: 'majority' }
      };
      expect(new ConnectionString(params).toURI())
        .to.eql('mongodb://host1?w=majority');
    });

    it('should correctly write hosts and a database', () => {
      const params = {
        hosts: [{ host: 'host1' }],
        database: 'database'
      };
      expect(new ConnectionString(params).toURI())
        .to.eql('mongodb://host1/database');
    });

    it('should correctly write hosts and a database and options', () => {
      const params = {
        hosts: [{ host: 'host1' }],
        database: 'database',
        options: { w: 'majority' }
      };
      expect(new ConnectionString(params).toURI())
        .to.eql('mongodb://host1/database?w=majority');
    });

    it('should correctly write auth and hosts and a database and options', () => {
      const params = {
        username: 'user',
        password: 'password',
        hosts: [{ host: 'host1' }],
        database: 'database',
        options: { w: 'majority' }
      };
      expect(new ConnectionString(params).toURI())
        .to.eql('mongodb://user:password@host1/database?w=majority');
    });
  });

  describe('toString', () => {
    it('should correctly print a connection string if no password is provided', () => {
      const params = {
        hosts: [{ host: 'host1' }],
        database: 'database',
        options: { w: 'majority' }
      };
      expect(new ConnectionString(params).toString())
        .to.eql('mongodb://host1/database?w=majority');
    });

    it('should correctly write a connection string with the password replaced by astericks characters if a password is provided', () => {
      const params = {
        hosts: [{ host: 'host1' }],
        username: 'admin',
        password: 'password',
        database: 'database',
        options: { w: 'majority' }
      };
      expect(new ConnectionString(params).toString())
        .to.eql('mongodb://admin:********@host1/database?w=majority');
    });
  });
});
