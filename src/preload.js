const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("transcriptionAPI", {
  startAction: () => ipcRenderer.send("startAction"),
  stopAction: () => ipcRenderer.send("stopAction"),
  setSettingsAction: (config) => ipcRenderer.send("setSettingsAction", config),
});

contextBridge.exposeInMainWorld("errorAPI", {
  onAuthKeyErrorAction: (callback) =>
    ipcRenderer.on("onAuthKeyErrorAction", () => callback()),
  onSoxErrorAction: (callback) =>
    ipcRenderer.on("onSoxErrorAction", () => callback()),
});
