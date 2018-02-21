import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {IonicStorageModule} from '@ionic/storage';
import {HttpModule} from '@angular/http';
import {HttpStorage} from '../providers/httpstorage';
import {FileTransfer, FileTransferObject} from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';
import {InAppPurchase} from '@ionic-native/in-app-purchase';

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';

import {LoginPage} from '../pages/login/login';
import {TabsPage} from '../pages/tabs/tabs';
import {HomePage} from '../pages/home/home';
import {BookPage} from '../pages/book/book';
import {LivePage} from '../pages/live/live';
import {VideoPage} from '../pages/video/video';
import {MinePage} from '../pages/mine/mine';
import {ListPage} from '../pages/list/list';
import {ListsPage} from '../pages/lists/lists';
import {SimuPage} from '../pages/simu/simu';
import {RecordPage} from '../pages/record/record';
import {ListDPage} from '../pages/listd/listd';
import {ExamPage} from '../pages/exam/exam';
import {FramePage} from '../pages/frame/frame';
import {FilePage} from '../pages/file/file';
import {NotePage} from '../pages/note/note';
import {NullPage} from '../pages/null/null';
import {ScorePage} from '../pages/score/score';
import {DtkPage} from '../pages/dtk/dtk';
import {FindPage} from '../pages/find/find';
import {MsgPage} from '../pages/msg/msg';
import {ErrorPage} from '../pages/error/error';
import {SendPage} from '../pages/send/send';
import {PlayPage} from '../pages/play/play';
import {BuyvipPage} from '../pages/buyvip/buyvip';
import {PhonePage} from '../pages/phone/phone';


import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    TabsPage,
    HomePage,
    BookPage,
    LivePage,
    VideoPage,
    MinePage,
    ListPage,
    ListsPage,
    SimuPage,
    RecordPage,
    ListDPage,
    NotePage,
    ExamPage,
    FramePage,
    FilePage,
    NullPage,
    ScorePage,
    DtkPage,
    FindPage,
    MsgPage,
    ErrorPage,
    SendPage,
    PlayPage,
    BuyvipPage,
    PhonePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: 'true',
      backButtonText: '',
      mode: 'ios'
    }),
    IonicStorageModule.forRoot({
      name: 'db_btz',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    TabsPage,
    HomePage,
    BookPage,
    LivePage,
    VideoPage,
    MinePage,
    ListPage,
    ListsPage,
    SimuPage,
    RecordPage,
    ListDPage,
    NotePage,
    ExamPage,
    FramePage,
    FilePage,
    NullPage,
    ScorePage,
    DtkPage,
    FindPage,
    MsgPage,
    ErrorPage,
    SendPage,
    PlayPage,
    BuyvipPage,
    PhonePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HttpStorage,
    FileTransfer,
    FileTransferObject,
    File,
    InAppPurchase
  ]
})
export class AppModule {
}
