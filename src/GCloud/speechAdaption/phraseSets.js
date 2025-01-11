const { Names } = require("./NameSet");
const { Terms } = require("./termSet");

const phraseSets = [
  {
    name: "Names",
    phrases: Names,
    boost: 20,
  },
  {
    name: "Terms",
    phrases: Terms,
    boost: 20,
  },
];

const speechAdaption = {
  phraseSets,
};

module.exports = { speechAdaption };
