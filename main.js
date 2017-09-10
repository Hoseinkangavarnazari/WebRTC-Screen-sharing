// This is the node.js server application      
require('fs').watch('reload', () => app.quit());                                                                                                                                                                                               
var WebSocketServer = require('websocket').server;
var https = require('https');
var fs = require('fs');
var clients = []; 
var options = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./cert.pem'),
  ca: fs.readFileSync('./chain.pem')
};


const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL("https://wezen.ir")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
mainWindow.setFullScreen(true)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.




var server = https.createServer(options, function(request, response) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      response.writeHead(500);
      return response.end('Error loading index.html');
    }   
    response.writeHead(200);
    response.end(data);
  }); 
});

server.listen(443, function() {

if (mainWindow === null) {
    createWindow()
  }


});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

function sendCallback(err) {
    if (err) console.error("send() error: " + err);
}

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    var connection = request.accept(null, request.origin);
    console.log(' Connection ' + connection.remoteAddress);
    clients.push(connection);
    
    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // process WebSocket message
            console.log((new Date()) + ' Received Message ' + message.utf8Data);
            // broadcast message to all connected clients
            clients.forEach(function (outputConnection) {
                if (outputConnection != connection) {
                  outputConnection.send(message.utf8Data, sendCallback);
                }   
            }); 
        }   
    }); 
    
    connection.on('close', function(connection) {
        // close user connection
	if (mainWindow !== null)
		mainWindow.reload();
        console.log((new Date()) + " Peer disconnected.");    
    }); 
});
