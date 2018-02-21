import {Component} from '@angular/core';
import {App, NavController, ViewController} from 'ionic-angular';
import {LoginPage} from '../login/login';
import {FilePage} from '../file/file';
import {FindPage} from '../find/find';
import {MsgPage} from '../msg/msg';
import {HttpStorage} from '../../providers/httpstorage';
import {InAppPurchase} from '@ionic-native/in-app-purchase';
import {AlertController} from 'ionic-angular';
import {PhonePage} from "../phone/phone";

@Component({
  selector: 'page-mine',
  templateUrl: 'mine.html'
})
export class MinePage {
  user: string;
  darkmode: any;
  newmsg: any;
  userLoginFlag: any;
  showInAppPurchase: boolean = false;

  constructor(private app: App,
              private navCtrl: NavController,
              private viewCtrl: ViewController,
              private httpstorage: HttpStorage,
              private iap: InAppPurchase,
              private alertCtrl: AlertController) {
    this.user = "";
    this.newmsg = false;
    this.userLoginFlag = false;
    this.loadInAppPurchase();
  }

  ionViewDidEnter() {
    this.httpstorage.getStorage('user', (data) => {

      if (data.token !== null && data.token !== "" && data.token.length > 1) {
        this.userLoginFlag = true;
      } else {
        this.userLoginFlag = false;
      }

      this.user = data.userId;
      this.httpstorage.getHttp("/app/feedbackController.do?doGetFeedBackInfo&token=" + data.token, (data) => {
        if (data != null && data.returnCode && data.content) {
          let flg = false;
          for (let v of data.content) {
            if (v.flag == 0) {
              flg = true;
              break;
            }
          }
          if (flg) this.newmsg = true;
        }
      })
    })
  }

  ionViewDidLoad() {
  }

  goMsg() {
    this.navCtrl.push(MsgPage);
  }

  goVideo() {
    this.navCtrl.push(FilePage);
  }

  goFind() {
    this.navCtrl.push(FindPage);
  }

  goSetPhone() {
    this.navCtrl.push(PhonePage);
  }

  dark() {
    if (this.darkmode) {
      this.app.setElementClass("darkmode", true);
    } else {
      this.app.setElementClass("darkmode", false);
    }
  }

  logout() {
    this.httpstorage.delStorage('user');
    this.app.setElementClass("darkmode", false);
    this.app.getRootNav().setRoot(LoginPage);
  }

  goBuyVip() {
    var this_ = this;
    this.httpstorage.getStorage('user', (data) => {
      if (data == undefined || data.token == undefined || data.token == "") {
        this_.presentAlert("试用账号无法购买会员，请先注册！");
      } else {
        this_.getAllProducts();
      }
    })
  }

  loadInAppPurchase() {
    var this_ = this;
    this.httpstorage.getHttp('/app/configController.do?getInAppPurchase', (data) => {
      if (data != null) {
        if (data.returnCode === 1) {
          this.httpstorage.setStorage("inAppPurchaseFlag", data.content.value);
          this_.showInAppPurchase = data.content.value === 'on';
        } else {
          this.httpstorage.setStorage("inAppPurchaseFlag", "off");
        }
      } else {
        this.httpstorage.setStorage("inAppPurchaseFlag", "off");
      }
    })
  }

  getAllProducts() {
    var this_ = this;
    this.iap
      .getProducts(['btzvip01'])
      .then((products) => {
        console.log(JSON.stringify(products));
        this_.iap
          .buy('btzvip01')
          .then((data) => {
            this_.doActiveUser();
          })
          .catch((err) => {
            this.presentAlert(JSON.stringify(err));
          });
      })
      .catch((err) => {
        this.presentAlert(JSON.stringify(err));
      });
  }

  presentAlert(msg) {
    let alert = this.alertCtrl.create({
      title: '提示！',
      subTitle: msg,
      buttons: ['确定']
    });
    alert.present();
  }

  doActiveUser() {
    var this_ = this;
    this.httpstorage.getStorage('user', (data) => {
      if (data == undefined || data.token == undefined || data.token == "") {
        this_.presentAlert("无有效的登录账号，会员无法激活！");
      } else {
        this_.httpstorage.getHttp('/app/userController.do?doActiveUser&username=' + data.userId, (data) => {
          console.log(JSON.stringify(data));
          if (data == null) {
            this_.presentAlert("会员激活失败！");
          } else {
            if (data.returnCode === 1) {
              this_.presentAlert("会员激活成功！");
            } else {
              this_.presentAlert(data.msg);
            }
          }
        })
      }
    })
  }


}
