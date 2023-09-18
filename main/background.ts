import { app, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { initializeAutoUpdater, autoUpdater } from "./helpers/update-handler"; // Import updateInterval too


const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

initializeAutoUpdater(); // Set up the auto-updater event listeners

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  // Check for update on startup
  autoUpdater.checkForUpdatesAndNotify();

})();

app.on("window-all-closed", () => {
  app.quit();
});
