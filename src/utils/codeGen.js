const { nanoid } = require('nanoid');
function generateCode() {
  return nanoid(7);
}

module.exports = { generateCode };