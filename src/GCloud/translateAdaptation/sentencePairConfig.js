const { referenceSentencePairs } = require('./sentencePairs');
const { config } = require('../../utils');

const referenceSentenceConfig = {
    referenceSentencePairLists: referenceSentencePairs,
    sourceLanguageCode: config.sourceLang,
    targetLanguageCode: config.targetLang
};

module.exports = { referenceSentenceConfig };