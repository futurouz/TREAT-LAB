const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, focusedWindow, Tray } = electron;

const iconPath = path.join(__dirname, "icon.png");
let main;
let appIcon;

app.setAppUserModelId("ou.com");
app.on("ready", () => {
  main = new BrowserWindow({});
  main.loadURL(
    url.format({
      pathname: path.join(__dirname, "public/login.html"),
      protocol: "file",
      slashes: true
    })
  );

  main.on("minimize", function(event) {
    event.preventDefault();
    main.hide();
  });

  main.on("close", function(event) {
    if (!app.isQuiting) {
      event.preventDefault();
      main.hide();
    }
    return false;
  });

  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

  appIcon = new Tray(iconPath);
  appIcon.setToolTip("Treatlap is running.");
  appIcon.setContextMenu(contextMenu);

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

  main.on("closed", () => {
    app.quit();
  });
});

const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  }
];

const contextMenuTemplate = [
  {
    label: "Show App",
    click: function() {
      main.show();
    }
  },
  {
    label: "Quit",
    click: function() {
      app.isQuiting = true;
      app.quit();
    }
  }
];

if (process.platform === "darwin") {
  menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== "production") {
  menuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform === "darwin" ? "Command+I" : "Ctrl+I",
        click(Item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: "reload"
      }
    ]
  });
}
