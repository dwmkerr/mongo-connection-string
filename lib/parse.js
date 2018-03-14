const querystring = require('querystring');

/**
 * splitOnLast - takes a string, finds the last instance of a character, splits
 * the string in two and returns the two parts.
 *
 * @param string - the source string.
 * @param character - the character to split on.
 * @param forwards - if 'true', when we don't find the split character, we
 * return [ string, null ], i.e. the whole string. If false, we are going
 * backwards, i.e. we would return [ null, string ].
 * @returns - an array with the two segments of the string:
 *   [ leftPart, rightPart ]
 * if the split character is not found, we get:
 *   [ string, null ] (if forwards is true)
 *   [ null, string ] (if forwards is false)
 */
function splitOnLast(string, character, forwards) {
  if (string === null) return [ null, null ];
  const index = string.lastIndexOf(character);
  if (index === -1) return forwards ? [ string, null ] : [ null, string ];
  return [ string.substring(0, index), string.substring(index + 1) ];
}

function splitOnLastForwards(string, character) {
  return splitOnLast(string, character, true);
}

function splitOnLastBackwards(string, character) {
  return splitOnLast(string, character, false);
}

function tryURIDecode(input) {
  //  If there is an % symbol, it won't need decoding.
  if (input.indexOf('%') === -1) return input;

  //  It's get a percent. If it decode, great. If it doesn't, it is probably
  //  a non-encoded password with a % in it.
  try {
    return decodeURIComponent(input);
  } catch (_) {
    return input;
  }
}

function parse(connectionString) {
  if (!connectionString) {
    throw new Error('\'connectionString\' is required');
  }

  //  First, rip out the main components of the connection string:
  //
  //  mongodb://username:password@host1:27017,host2:27017,host3:27017/database?w=majority&wtimeoutMS=6000
  //  ^         ^                 ^                                   ^       ^
  //  protocol  auth              hosts                               db      options

  //  The protocol part is everything from the beginning to ://.
  //  mongodb://username:password@host1:27017,host2:27017,host3:27017/database?w=majority&wtimeoutMS=6000
  const protocol = connectionString.match(/(^.*:\/\/)/)[1];
  const remainder = connectionString.substring(protocol.length);

  //  The options part is everything which follows the last question mark.
  //  username:password@host1:27017,host2:27017,host3:27017/database?w=majority&wtimeoutMS=6000
  const [ withoutOptions, optionsPart ] = splitOnLastForwards(remainder, '?');

  //  The database part is everything which follows the last forward slash.
  //  username:password@host1:27017,host2:27017,host3:27017/database
  const [ withoutDatabase, database ] = splitOnLastForwards(withoutOptions, '/');

  //  The auth part is everything which preceeds the last @, hosts is everything which follows.
  //  username:password@host1:27017,host2:27017,host3:27017
  const [ authPart, hostsString ] = splitOnLastBackwards(withoutDatabase, '@');

  //  The username and password is split by a colon.
  const [ username, password ] = splitOnLastForwards(authPart, ':');

  //  Hosts are separated by commas.
  const hosts = hostsString.split(',').map((hostString) => {
    const [ host, portString ] = splitOnLastForwards(hostString, ':');
    return { host, port: portString ? Number.parseInt(portString, 10) : null };
  });

  return {
    protocol,
    username: username ? tryURIDecode(username) : null,
    password: password ? tryURIDecode(password) : null,
    hosts,
    options: optionsPart ? querystring.parse(optionsPart) : {},
    database: database
  };
}

module.exports = parse;
