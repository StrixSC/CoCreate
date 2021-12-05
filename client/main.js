const { app, BrowserWindow, ipcMain, Notification } = require("electron");
let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1800, height: 900, electronBuilder: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
		}
	})

	mainWindow.loadURL(`file://${__dirname}/dist/index.html#`)
	mainWindow.webContents.openDevTools();
	mainWindow.webContents.on("new-window", function (event, url) {
		event.preventDefault();
		const win = new BrowserWindow({width: 500, height: 800});
		const newUrl = `file://${__dirname}/dist/index.html#${url.replace("file:///#", "")}`;
		console.log(newUrl);
		win.loadURL(newUrl);
	});

	mainWindow.webContents.on("did-fail-load", function () {
		console.log("did-fail-load");
		mainWindow.loadUrl('file://' + __dirname + '/dist/index.html#');
	});

	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

// app.on('ready', createWindow);
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'

function showNotification() {
	new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}

app.whenReady().then(createWindow).then(showNotification)

ipcMain.on('notification', (_, message, text_channel) => {
	console.log("text_channel", text_channel);
	console.log("message", message);
	new Notification({
		title: text_channel,
		body: message,
		sound: 'low'
	}).show();
})