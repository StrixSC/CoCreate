const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200, height: 1200, electronBuilder: {
			nodeIntegration: true
		}
	})

	mainWindow.loadURL(`file://${__dirname}/dist/index.html#`)

	mainWindow.webContents.on("did-fail-load", function () {
		console.log("did-fail-load");

		mainWindow.loadUrl('file://' + __dirname + '/dist/index.html#');
	});

	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
