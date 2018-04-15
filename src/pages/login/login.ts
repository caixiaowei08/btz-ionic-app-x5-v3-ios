import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import {PhonePage} from "../phone/phone";
import {HttpStorage} from '../../providers/httpstorage';
import {BuyvipPage} from '../buyvip/buyvip';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {

  constructor(public alertCtrl: AlertController,
              public navCtrl: NavController,
              public navParams: NavParams,
              public httpstorage: HttpStorage,
              public storage: Storage) {
    this.clear();
    this.loadInAppPurchase();
  }

  account: string = "";
  password: string = "";
  showInAppPurchase: boolean = false;
  pwm: any;
  pwmuser: any;
  pwmopw: any;
  pwmnpw: any;

  pwf: any;
  pwfs: any;
  pwfuser: any;
  pwfyzm: any;
  pwfpwd: any;

  pwr: any;
  pwruser: string = "";
  pwremail: string = "";
  pwrpwd: string = "";

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
    });
  }

  login() {
    var this_ = this;
    this_.httpstorage.postHttp('/app/loginController.do?loginPost', JSON.stringify({
      userId: this_.account,
      userPwd: this_.password
    }), (data) => {
      if (data != null) {
        if (data.returnCode > 0) {
          let user: any = {
            token: data.content.token,
            userId: data.content.userId,
            userName: data.content.userName,
            phoneNo: data.content.phoneNo
          }

          this_.storage.set("user", user).then((data) => {
              //跳转设置手机号
              this_.navCtrl.setRoot(TabsPage, {comeFrom: 'loginPage', tabsSelect: 'loginPage'});
            }
          ).catch((err) => {
            let alert = this.alertCtrl.create({
              title: '系统通知',
              subTitle: JSON.stringify(err),
              buttons: ['好'],
            });
            alert.present();
          });
        }
        else {
          let alert = this.alertCtrl.create({
            title: '系统通知',
            subTitle: "账号或者密码错误！",
            buttons: ['好']
          });
          alert.present();
        }
      } else {
        let alert = this.alertCtrl.create({
          title: '系统通知',
          subTitle: '网络异常，检查网络！',
          buttons: ['好']
        });
        alert.present();
      }
    });
  }

  showAlertCtrl(msg) {
    let alert = this.alertCtrl.create({
      title: '系统通知',
      subTitle: msg,
      buttons: ['好'],
    });
    alert.present();
  }

  free() {
    let user: any = {
      token: '',
      userId: '百题斩免登陆测试用户',
      userName: '',
      phoneNo: ''
    }
    this.storage.set("user", user).then((data) => {
      this.navCtrl.setRoot(TabsPage);
    }).catch((err) => {
      this.showAlertCtrl("登录异常：" + JSON.stringify(err));
    });
  }

  clear() {
    this.pwm = false;
    this.pwmuser = "";
    this.pwmopw = "";
    this.pwmnpw = "";
    this.pwf = false;
    this.pwfs = true;
    this.pwfuser = "";
    this.pwfyzm = "";
    this.pwfpwd = "";

    this.pwr = false;
    this.pwruser = "";
    this.pwremail = "";
    this.pwrpwd = "";
  }

  pwfsend() {
    if (this.pwfuser == "") {
      let alert = this.alertCtrl.create({
        title: '系统通知',
        subTitle: '请先输入账号！',
        buttons: ['好'],
      });
      alert.present();
    }
    else {
      this.httpstorage.getHttp("/app/userController.do?sendEmail&userId=" + this.pwfuser, (data) => {
        let alert = this.alertCtrl.create({
          title: '系统通知',
          subTitle: data.msg,
          buttons: ['好'],
          //cssClass:'mid'
        });
        alert.present();
        if (data.returnCode) {
          this.pwfs = false;
        }
      })
    }
  }

  doRegister() {
    if (this.pwruser == "" || this.pwremail == "" || this.pwrpwd == "") {
      let alert = this.alertCtrl.create({
        title: '系统通知',
        subTitle: '请填写完整的注册信息！',
        buttons: ['好'],
      });
      alert.present();
    } else {
      this.httpstorage.getHttp("/app/userController.do?doRegisterUser&username=" + this.pwruser + "&email=" + this.pwremail + "&password=" + this.pwrpwd, (data) => {
        let alert = this.alertCtrl.create({
          title: '系统通知',
          subTitle: data.msg,
          buttons: ['好'],
        });
        alert.present();
      })
    }
  }

  //验证码修改码 修改密码
  pwfok() {
    var this_ = this;
    if (this_.pwfyzm != "" && this_.pwfpwd != "") {
      this_.httpstorage.postHttp('/app/userController.do?doUpdatePwdByEmailCodePost', JSON.stringify({
        userId: this_.pwfuser,
        newPwd: this_.pwfpwd,
        emailCode: this_.pwfyzm
      }), (data) => {
        let alert = this_.alertCtrl.create({
          title: '系统通知',
          subTitle: data.msg,
          buttons: ['好']
        });
        alert.present();
        if (data.returnCode) this.clear();
      });
    } else {
      let alert = this_.alertCtrl.create({
        title: '系统通知',
        subTitle: "请填写验证码和新密码！",
        buttons: ['好']
      });
      alert.present();
    }
  }

  pwmok() {
    var this_ = this;
    this_.httpstorage.postHttp('/app/userController.do?doUpdatePwdByOldPwdPost', JSON.stringify({
      userId: this_.pwmuser,
      newPwd: this_.pwmnpw,
      oldPwd: this_.pwmopw
    }), (data) => {
      let alert = this.alertCtrl.create({
        title: '系统通知',
        subTitle: data.msg,
        buttons: ['好'],
      });
      alert.present();
      if (data.returnCode) {
        this.clear();
      }
    });
  }

  //发送短信验证码
  doSendSmsCheckCode() {
    var this_ = this;
    this_.httpstorage.postHttp('/app/userController.do?doSendSmsCodeByTokenAndPhoneNo', JSON.stringify({
      token: "b58e8c224f2345ec99fe042a1349728d",
      phoneNo: "13162302663"
    }), (data) => {
      let alert = this.alertCtrl.create({
        title: '系统通知',
        subTitle: data.msg,
        buttons: ['好'],
      });
      alert.present();
    });
  }

  //发送短信验证码
  doSavePhoneNo() {
    var this_ = this;
    this_.httpstorage.postHttp('/app/userController.do?doCheckSmsCodeAndSetPhoneNoByTokenAndPhoneNoAndSmsCode', JSON.stringify({
      token: "b58e8c224f2345ec99fe042a1349728d",
      phoneNo: "13162302663",
      smsCheckCode: "984042",
    }), (data) => {
      let alert = this.alertCtrl.create({
        title: '系统通知',
        subTitle: data.msg,
        buttons: ['好'],
      });
      alert.present();
    });
  }

  forget() {
    this.pwf = true;
  }

  mod() {
    this.pwm = true;
  }

  register() {
    this.pwr = true;
  }


  buyvip() {
    this.navCtrl.push(BuyvipPage, {});
  }
}
