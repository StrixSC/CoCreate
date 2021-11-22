const { app, BrowserWindow, ipcMain, Notification } = require("electron");
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
const url = require("url");
const path = require("path");

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `../dist/index.html`),
      protocol: "file:",
      slashes: true,
    })
  );
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
  
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'

// function showNotification () {
//   new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
// }

// app.whenReady().then(createWindow).then(showNotification)


ipcMain.on('notification', (_, message, text_channel) => {
  console.log("text_channel", text_channel);
  console.log("message", message);
  new Notification({
    title: text_channel, 
    body: message,
    sound: 'low'
  }).show();
})