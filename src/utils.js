export const users = ["Default"];

export const langOptions = ["en_US", "ja-JP"];

const audioSettingByUser = {
  Default: {
    streamingLimit: 14500,
    updateDelay: 7250,
  },
};

export const config = {
  projectId: "",
  sourceLang: "en-US",
  targetLang: "ja-JP",
  translationModel: "Default",
  keyFilename: "../../key/gspeech_key.json",
  streamingLimit: 14500,
  updateDelay: 7250,
  // for transcription
  request: {
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      // sourceLang
      languageCode: "en-US",
    },
    alternativeLangaugeCodes: langOptions,
    use_enhanced: true,
    model: "latest-long",
    interimResults: true,
  },
};

export function getAudioSettingByUser(user) {
  if (!users.includes(user)) {
    return audioSettingByUser["Default"];
  }
  return audioSettingByUser[user];
}
