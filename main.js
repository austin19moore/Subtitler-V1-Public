const { nativeImage, ipcMain } = require("electron");
const { app, BrowserWindow } = require("electron/main");
const {
  startAction,
  stopAction,
  setSettings,
} = require("./src/GCloud/Transcription/Transcription");
const path = require("node:path");
const fs = require("fs");

if (!fs.existsSync(app.getPath("documents") + "\\subtitler-v1\\")) {
  fs.mkdirSync(app.getPath("documents") + "\\subtitler-v1\\");
}

function handleStartAction() {
  startAction();
}

function handleStopAction() {
  stopAction();
}

function handleSetSettingsAction(event, config) {
  config.outputFilePath = app.getPath("documents") + "\\subtitler-v1\\";
  config.keyFilename =
    app.getPath("documents") + "\\subtitler-v1\\auth_key.json";
  setSettings(config);
}

const createWindow = () => {
  const icon = nativeImage.createFromPath("./public/icon.png");

  const win = new BrowserWindow({
    width: 350,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    if (
      !fs.existsSync(app.getPath("documents") + "\\subtitler-v1\\auth_key.json")
    ) {
      win.webContents.send("onAuthKeyErrorAction");
    }

    if (!process.env.PATH || !process.env.PATH.includes("sox-14-4-1")) {
      win.webContents.send("onSoxErrorAction");
    }
  });

  win.removeMenu();
  win.setIcon(icon);
  win.loadFile("index.html");
};

app.whenReady().then(() => {
  ipcMain.on("startAction", handleStartAction);
  ipcMain.on("stopAction", handleStopAction);
  ipcMain.on("setSettingsAction", handleSetSettingsAction);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
