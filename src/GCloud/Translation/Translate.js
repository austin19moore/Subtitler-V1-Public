const fs = require("fs");
const { TranslationServiceClient } = require("@google-cloud/translate");
const {
  referenceSentenceConfig,
} = require("../translateAdaptation/sentencePairConfig");

let translationClient;

async function writeToFile(text, path) {
  fs.writeFileSync(path, text, { encoding: "utf8", flag: "w+" });
}

async function log(transcription, translation) {
  fs.appendFileSync(
    "log.txt",
    transcription + "\n" + translation + "\n----------\n"
  );
}

async function translateText(text, config) {
  if (!text || text === "") {
    return;
  }

  // instantiate translation client
  if (!translationClient) {
    translationClient = new TranslationServiceClient({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
  }

  referenceSentenceConfig.sourceLanguageCode = config.sourceLang;
  referenceSentenceConfig.targetLanguageCode = config.targetLang;
  const location = "global";
  const request = {
    parent: `projects/${config.projectId}/locations/${location}`,
    contents: [text],
    mimeType: "text/plain",
    sourceLanguageCode: config.sourceLang,
    targetLanguageCode: config.targetLang,
    referenceSentenceConfig,
  };

  // add model if exists
  if (config.translationModel && config.translationModel !== "Default") {
    request.model = `projects/${config.projectId}/locations/${location}/models/${config.translationModel}`;
  }

  try {
    const [response] = await translationClient.translateText(request);
    const translation = response.translations[0].translatedText;
    if (response.translations[0] && response.translations[0].translatedText) {
      console.log("Translation: " + translation);
      log(text, translation);
      writeToFile(text, config.outputFilePath + "transcription.txt");
      writeToFile(translation, config.outputFilePath + "translation.txt");
    }
  } catch (e) {
    console.log("Failed to translate: " + e);
    return;
  }
}

module.exports = { translateText };
