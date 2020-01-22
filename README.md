# mongo-connection-string

[![CircleCI](https://circleci.com/gh/dwmkerr/mongo-connection-string.svg?style=shield)](https://circleci.com/gh/dwmkerr/mongo-connection-string) [![codecov](https://codecov.io/gh/dwmkerr/mongo-connection-string/branch/master/graph/badge.svg)](https://codecov.io/gh/dwmkerr/mongo-connection-string) [![Greenkeeper badge](https://badges.greenkeeper.io/dwmkerr/mongo-connection-string.svg)](https://greenkeeper.io/) [![GuardRails badge](https://badges.guardrails.io/dwmkerr/mongo-connection-string.svg?token=569f2cc38a148f785f3a38ef0bcf5f5964995d7ca625abfad9956b14bd06ad96&provider=github)](https://dashboard.guardrails.io/default/gh/dwmkerr/mongo-connection-string)

Utilities to help with MongoDB connection strings and related tasks.

## Parsing Connection Strings

Parse a connection string into `ConnectionString` object:

```js
const { ConnectionString } = require('mongo-connection-string');
const connectionString = new ConnectionString('mongodb://user:p@ssw0rd@host1,host2:2700/db?w=majority');
```

The connection string object has the following fields:

```
{
  protocol: 'mongodb://',
  username: 'user',
  password: 'p@ssw0rd',
  hosts: [{ host: 'host1', port: null }, { host: 'host2', port: 2700 }],
  database: 'db',
  options: {
    w: 'majority'
  }
}
```

You can now write it as a MongoDB compatible URI, or a more human readable string:

```js
connectionString.toURI();

//  Produces:
//  mongodb://user:p%40ssw0rd/db?readPreference=secondary

connectionString.toString();

//  Produces:
//  mongodb://user:********/db?readPreference=secondary
//  (a little bit safer to go into logs/error messages etc)!
```

## Building Connection Strings

The `ConnectionString` constructor can also take the fields required to build a
connection string:

```js
const { ConnectionString } = require('mongo-connection-string');

const connectionString = ConnectionString({
  username: 'user',
  password: 'pwd',
  hosts: [{ host: 'host1' }],
  database: 'db',
  options: {
    readPreference: 'secondary'
  }
});

//  Write out the connection string.
console.log(connectionString.toURI());
```

Produces:

```
mongodb://user:pwd@host1/db?readPreference=secondary
```

## Url Encoding

When parsing a connection string, encoded charecters are unencoded:

```js
const { parse } = require('mongo-connection-string');
const connectionString = new ConnectionString('mongodb://%40dmin:P%40ssword%3C%3E%2F@host1,host2:2700/db?w=majority');

//  Write out the connection string.
console.log(connectionString.username);
console.log(connectionString.password);
```

Produces:

```
@dmin
P@ssword<>/
```

Similarly, connection string object usernames and passwords are encoded:

```js
const { ConnectionString } = require('mongo-connection-string');

const connectionString = ConnectionString({
  username: '@dmin',
  password: 'P@ssword<>/',
  hosts: [{ host: 'localhost' }]
});

//  Write out the connection string.
console.log(connectionString.toURI());
```

Produces:

```
mongodb://%40dmin:P%40ssword%3C%3E%2F@localhost
```

This means you can actually use the library to clean up a non-url encoded connection string. This can be useful to allow connection strings to be input in a more readable way ([mongo-monitor](https://github.com/mongo-monitor) does this):

```js
new ConnectionString('@dmin:P@ssword<>/@localhost').toURI();
```

Produces:

```
mongodb://%40dmin:P%40ssword%3C%3E%2F@localhost
```

## Notes

- If no protocol is specifed, the library will assume `mongodb://` should be used.
- If there is a `%` symbol in the username or password, the code will *try* to URI decode it. If this fails, it will assume the username or password is plain text with a `%` symbol as part of the password. This means that if your password is actually something like `p%40ssword` then this will be URI decoded to `p@ssword`.
