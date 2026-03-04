const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.handle("select-image", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png"] }],
    properties: ["openFile"],
  });

  if (canceled) return null;
  return filePaths[0];
});

ipcMain.handle("save-image", async (event, imageData) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: "processed.png",
    filters: [{ name: "PNG Image", extensions: ["png"] }],
  });
  if (canceled) return null;

  // Strip off data URL header
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(filePath, base64Data, "base64");
  return filePath;
});
