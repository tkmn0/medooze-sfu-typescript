require('dotenv').config();
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
const { BrowserView, BrowserWindow, app } = require('electron');


let mainWindow = null;
app.on('ready', () => {
  // mainWindowを作成（windowの大きさや、Kioskモードにするかどうかなどもここで定義できる）
  mainWindow = new BrowserWindow({
    width: 680,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  });
  // Electronに表示するhtmlを絶対パスで指定（相対パスだと動かない）
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // ChromiumのDevツールを開く
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  let statsView = new BrowserView({
    webPreferences: {
      nodeIntegration: false
    }
  });
  mainWindow.setBrowserView(statsView);
  statsView.setBounds({ x: 0, y: 400, width: mainWindow.getBounds().width, height: 700 });
  statsView.setAutoResize({
    width: true,
    height: true,
    vertical: true,
    horizontal: true
  });
  statsView.setBackgroundColor('white');
  statsView.webContents.loadURL('chrome://webrtc-internals');
});