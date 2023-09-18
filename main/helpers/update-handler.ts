import { dialog } from "electron";
import { autoUpdater as electronAutoUpdater } from "electron-updater";
import * as log from "electron-log";

export const autoUpdater = electronAutoUpdater;

export const initializeAutoUpdater = () => {
  autoUpdater.on("checking-for-update", () => {
    log.info("업데이트 확인 중...");
  });

  autoUpdater.on("update-not-available", (info: any) => {
    log.info("현재 최신버전입니다.");
  });

  autoUpdater.on("error", (err) => {
    log.info("에러가 발생하였습니다. 에러내용 : " + err);
  });

  autoUpdater.on("update-available", (info: any) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Ok"],
      title: "Update Available",
      message: "Hello",
      detail: "A new version download started. The app will be restarted to install the update.",
    };
    dialog.showMessageBox(dialogOpts);
  });

  autoUpdater.on("update-downloaded", (info: any) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: "Hello",
      detail: "A new version has been downloaded. Restart the application to apply the updates.",
    };
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      log.info("LOG: " + returnValue.response);
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });
}
