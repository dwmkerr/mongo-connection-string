const parse = require('./parse');
const querystring = require('querystring');

function isString(val) {
  return Object.prototype.toString.call(val) === '[object String]';
}

function ConnectionString(params) {
  if (!params) {
    throw new Error('Connection string \'params\' are required');
  }

  const values = isString(params) ? parse(params) :  params;
  const {
    protocol,
    username,
    password,
    hosts,
    database,
    options
  } = values;

  if (!hosts) {
    throw new Error('\'hosts\' is required');
  }

  if (username && !password) {
    throw new Error('When \'username\' is specified, \'password\' is required');
  }

  if (!username && password) {
    throw new Error('When \'password\' is specified, \'username\' is required');
  }

  this.protocol = protocol;
  this.username = username;
  this.password = password;
  this.hosts = hosts;
  this.database = database;
  this.options = options;
}

/**
 * toURI - returns a mongodb compatible URI connection string.
 *
 * @returns {string} - a mongodb compatible URI connection string.
 */
ConnectionString.prototype.toURI = function() {
  //  Build the full connection string.
  const protocolPart = this.protocol || 'mongodb://';
  const authPart = this.username ? `${encodeURIComponent(this.username)}:${encodeURIComponent(this.password)}@` : '';
  const hostsPart = this.hosts.map((h) => {
    return h.port ? `${h.host}:${h.port}` : h.host;
  }).join(',');
  const databasePart = this.database ? `/${encodeURIComponent(this.database)}` : '';

  //  Options are only needed if we actually have values in the options object.
  const optionsPart = (this.options && Object.getOwnPropertyNames(this.options).length > 0)
    ? `?${querystring.stringify(this.options)}` : '';
  
  return [protocolPart, authPart, hostsPart, databasePart, optionsPart].join('');
};

/**
 * toString - returns a human readable version of the connection string. Special
 * characters are left as-is, i.e. not URI encoded. The password (if present) is
 * replaced with astericks symbols, making this function safer to use if you
 * want to log the value or present it to users.
 *
 * @returns {string} - a human readable connection string. Not URI encoded, with
 * the password masked.
 */
ConnectionString.prototype.toString = function() {
  //  Create a safe version of the password.
  const safePassword = this.password ? this.password.replace(/./g, '*') : null;

  //  Build the full connection string, but do not URI encode.
  const protocolPart = this.protocol || 'mongodb://';
  const authPart = this.username ? `${this.username}:${safePassword}@` : '';
  const hostsPart = this.hosts.map((h) => {
    return h.port ? `${h.host}:${h.port}` : h.host;
  }).join(',');
  const databasePart = this.database ? `/${this.database}` : '';

  //  Options are only needed if we actually have values in the options object.
  const optionsPart = (this.options && Object.getOwnPropertyNames(this.options).length > 0)
    ? `?${querystring.stringify(this.options)}` : '';
  
  return [protocolPart, authPart, hostsPart, databasePart, optionsPart].join('');
};

module.exports = ConnectionString;
