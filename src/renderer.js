import { users, langOptions, config, getAudioSettingByUser } from "./utils.js";

const userSelect = document.getElementById("userSelect");
users.forEach((user) => {
  userSelect.add(
    new Option(user, user),
    false,
    user == "Default" ? true : false
  );
});

const sourceLangSelect = document.getElementById("sourceLangSelect");
langOptions.forEach((option) => {
  sourceLangSelect.add(
    new Option(option, option, false, option == "ja-JP" ? true : false)
  );
});

const targetLangSelect = document.getElementById("targetLangSelect");
langOptions.forEach((option) => {
  targetLangSelect.add(
    new Option(option, option, false, option == "en-US" ? true : false)
  );
});

document.getElementById("startStopButton").onclick = function () {
  if (this.innerText === "Start") {
    config.model = userSelect.value;
    config.sourceLang = sourceLangSelect.value;
    config.targetLang = targetLangSelect.value;
    config.streamingLimit = getAudioSettingByUser(
      userSelect.value
    ).streamingLimit;
    config.updateDelay = getAudioSettingByUser(userSelect.value).updateDelay;
    window.transcriptionAPI.setSettingsAction(config);

    window.transcriptionAPI.startAction();
    this.innerText = "Stop";
  } else {
    window.transcriptionAPI.stopAction();
    this.innerText = "Start";
  }
  toggleRecordingIcon();
  toggleDisableOptions();
};

function showAuthKeyError() {
  toggleDisableOptions();
  document.getElementById("startStopButton").disabled = true;
  document.getElementById("authKeyErrorLabel").style.display = "";
}

function showSoxError() {
  toggleDisableOptions();
  document.getElementById("startStopButton").disabled = true;
  document.getElementById("soxErrorLabel").style.display = "";
}

window.errorAPI.onAuthKeyErrorAction(showAuthKeyError);

window.errorAPI.onSoxErrorAction(showSoxError);

document.getElementById("authKeyErrorLabelHide").onclick = function () {
  document.getElementById("authKeyErrorLabel").style.display = "none";
};

document.getElementById("soxErrorLabelHide").onclick = function () {
  document.getElementById("soxErrorLabel").style.display = "none";
};

function toggleRecordingIcon() {
  const icon = document.getElementById("recordingIcon");
  icon.style.fill = icon.style.fill == "red" ? "black" : "red";
}

function toggleDisableOptions() {
  const shouldDisable = !document.getElementById("userSelect").disabled;
  document.getElementById("userSelect").disabled = shouldDisable;
  document.getElementById("sourceLangSelect").disabled = shouldDisable;
  document.getElementById("targetLangSelect").disabled = shouldDisable;
}
