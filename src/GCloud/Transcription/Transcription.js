const { Writable } = require("stream");
const recorder = require("node-record-lpcm16");
const { translateText } = require("../Translation/Translate");
const { speechAdaption } = require("../speechAdaption/phraseSets");
const speech = require("@google-cloud/speech").v1p1beta1;

let config = {};
let client;
let recognizeStream = null;
let restartCounter = 0;
let audioInput = [];
let lastAudioInput = [];
let resultEndTime = 0;
let finalRequestEndTime = 0;
let newStream = true;
let bridgingOffset = 0;
let stopped = true;
let previousTranscription = "";
let currRecorder;
let previousEndTime = 0;
let justRestarted = false;

function startStream() {
  audioInput = [];

  recognizeStream = client
    .streamingRecognize(config.request)
    .on("error", (err) => {
      if (err.code === 11) {
        restartStream();
      } else {
        console.error("API request error " + err);
      }
    })
    .on("data", speechCallback);

  if (config.streamingLimit !== 0) {
    setTimeout(restartStream, config.streamingLimit);
  }
}

const speechCallback = (stream) => {
  if (stopped) {
    return;
  }
  resultEndTime =
    stream.results[0].resultEndTime.seconds * 1000 +
    Math.round(stream.results[0].resultEndTime.nanos / 1000000);

  const correctedTime =
    resultEndTime - bridgingOffset + config.streamingLimit * restartCounter;

  const result = stream.results[0];

  let text = "";
  if (result && result.alternatives[0]) {
    text = result.alternatives[0].transcript;
  }

  if (justRestarted) {
    if (resultEndTime > config.updateDelay) {
      justRestarted = false;
    }
    return;
  }

  if (
    text != previousTranscription &&
    text != "" &&
    correctedTime > previousEndTime + config.updateDelay
  ) {
    translateText(text, config);
    previousTranscription = text;
    previousEndTime = correctedTime;
  }
};

const audioInputStreamTransform = new Writable({
  // write data chunk
  write(chunk, encoding, next) {
    if (!stopped) {
      if (newStream && lastAudioInput.length !== 0) {
        const chunkTime = config.streamingLimit / lastAudioInput.length;
        if (chunkTime !== 0) {
          if (bridgingOffset < 0) {
            bridgingOffset = 0;
          }
          if (bridgingOffset > finalRequestEndTime) {
            bridgingOffset = finalRequestEndTime;
          }
          const chunksFromMS = Math.floor(
            (finalRequestEndTime - bridgingOffset) / chunkTime
          );
          bridgingOffset = Math.floor(
            (lastAudioInput.length - chunksFromMS) * chunkTime
          );

          for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
            if (recognizeStream) {
              recognizeStream.write(lastAudioInput[i]);
            }
          }
        }
        newStream = false;
      }

      audioInput.push(chunk);

      if (recognizeStream) {
        recognizeStream.write(chunk);
      }
    }
    next();
  },

  final() {
    if (recognizeStream) {
      recognizeStream.end();
    }
  },
});

function restartStream() {
  // restarts the data stream, clears variables
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream.removeListener("data", speechCallback);
    recognizeStream = null;
  }
  resultEndTime = 0;
  lastAudioInput = [];
  lastAudioInput = audioInput;
  restartCounter++;
  previousTranscription = "";
  newStream = true;
  justRestarted = true;
  startStream();
}

function startAction() {
  if (!currRecorder) {
    currRecorder = recorder.record({
      sampleRateHertz: config.request.config.sampleRateHertz,
      threshold: 0,
      silence: 1000,
      keepSilence: true,
      recordProgram: "arecord",
    });

    currRecorder
      .stream()
      .on("error", (err) => {
        console.error("Audio recording error " + err);
      })
      .pipe(audioInputStreamTransform);
  }

  stopped = false;
  newStream = true;
  justRestarted = true;
  startStream();
}

function stopAction() {
  // stop data stream, clear variables
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream.removeListener("data", speechCallback);
    recognizeStream = null;
  }
  resultEndTime = 0;
  previousEndTime = 0;
  previousTranscription = "";
  lastAudioInput = [];
  lastAudioInput = audioInput;
  stopped = true;
}

function setSettings(passedConfig) {
  // set config from utils.js
  config = passedConfig;
  config.request.config.languageCode = config.sourceLang;
  config.request.config.adaptation = speechAdaption;
  if (!client) {
    client = new speech.SpeechClient({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
  }
}

module.exports = { startAction, stopAction, setSettings };
