import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HttpStorage} from '../providers/httpstorage';

import {TabsPage} from '../pages/tabs/tabs';
import {LoginPage} from '../pages/login/login';

declare var window;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(private platform: Platform, private statusBar: StatusBar, private splashScreen: SplashScreen, private httpstorage: HttpStorage) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      statusBar.backgroundColorByHexString("#000");
      splashScreen.hide();
      httpstorage.getStorage('user', (data) => {
        if (data == null) {
          this.rootPage = LoginPage;
        }
        else {
          this.rootPage = TabsPage;
        }
      });

      if (window.JPush) window.JPush.init();
    });
  }
}
