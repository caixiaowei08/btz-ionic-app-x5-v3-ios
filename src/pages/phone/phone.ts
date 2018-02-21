import {Component} from '@angular/core';
import {Storage} from '@ionic/storage';
import {HttpStorage} from '../../providers/httpstorage';
import {AlertController, NavController} from 'ionic-angular';
import {LoginPage} from '../../pages/login/login';

@Component({
  selector: 'page-phone',
  templateUrl: 'phone.html'
})

export class PhonePage {

  constructor(public storage: Storage,
              public httpstorage: HttpStorage,
              public alertCtrl: AlertController,
              public navCtrl: NavController) {
    this.init();
  }

  phoneNo: number;
  smsCheckCode: number;
  sendSmsFlag: boolean = false;
  hasBindPhoneNoFlag: boolean = false;
  currentPhoneNo: string = "";

  init() {
    let this_ = this;
    this_.storage.get("user").then((user) => {
      if (user.phoneNo !== null && user.phoneNo !== '0' && user.phoneNo.length === 11) {
        this_.hasBindPhoneNoFlag = true;
        this_.currentPhoneNo = user.phoneNo;
      }
    });

  }

  doGetPhoneSmsCheckCode() {
    let this_ = this;
    this_.storage.get("user").then((user) => {
        let phoneNoStr = this_.phoneNo === undefined ? "" : this_.phoneNo + "";

        if (user.token === "") {
          this_.showSystemMsg("游客账号不能绑定手机号！");
          return;
        }

        if (phoneNoStr === null || phoneNoStr === "") {
          this_.showSystemMsg("请输入您的手机号码！");
          return;
        }

        if (phoneNoStr.length !== 11) {
          this_.showSystemMsg("请输入正确的手机号码！");
          return;
        }

        this_.httpstorage.postHttp('/app/userController.do?doSendSmsCodeByTokenAndPhoneNo', JSON.stringify({
          token: user.token,
          phoneNo: phoneNoStr
        }), (data) => {
          if (data != null) {
            if (data.returnCode === 1) {
              this_.sendSmsFlag = true;
              this_.showSystemMsg(data.msg);
            } else if (data.returnCode === 0) {
              this_.showSystemMsg(data.msg);
            } else if (data.returnCode === 3) {
              this_.showSystemMsg(data.msg);
              this_.navCtrl.setRoot(LoginPage);
            }
          } else {
            this_.showSystemMsg("网络异常,请检查网络！");
          }
        })

      }
    ).catch(err => {

    });

  }

  doSavePhoneNoByTokenAndCheckCode() {
    let this_ = this;
    this_.storage.get("user").then((user) => {
        let phoneNoStr = this_.phoneNo === undefined ? "" : this_.phoneNo + "";
        let smsCheckCodeStr = this_.smsCheckCode === undefined ? "" : this_.smsCheckCode + "";

        if (user.token === "") {
          this_.showSystemMsg("游客账号不能绑定手机号！");
          return;
        }

        if (phoneNoStr === null || phoneNoStr === "") {
          this_.showSystemMsg("请输入您的手机号码！");
          return;
        }

        if (phoneNoStr.length !== 11) {
          this_.showSystemMsg("请输入正确的手机号码！");
          return;
        }

        if (smsCheckCodeStr === null || smsCheckCodeStr === "") {
          this_.showSystemMsg("请输入您的短信验证码！");
          return;
        }

        if (smsCheckCodeStr.length !== 6) {
          this_.showSystemMsg("请输入6位短信验证码");
          return;
        }

        this_.httpstorage.postHttp('/app/userController.do?doCheckSmsCodeAndSetPhoneNoByTokenAndPhoneNoAndSmsCode', JSON.stringify({
          token: user.token,
          phoneNo: phoneNoStr,
          smsCheckCode: smsCheckCodeStr
        }), (data) => {
          if (data != null) {
            if (data.returnCode === 1) {
              user.phoneNo = phoneNoStr;
              console.log(user);
              this_.storage.set("user", user).then(userDb => {
                this_.hasBindPhoneNoFlag = true;
                this_.currentPhoneNo = user.phoneNo;
                this_.showSystemMsg(data.msg);
                this_.navCtrl.pop();
              })
            } else if (data.returnCode === 0) {
              this_.showSystemMsg(data.msg);

            } else if (data.returnCode === 3) {
              this_.showSystemMsg(data.msg);
              this_.navCtrl.setRoot(LoginPage);
            }
          } else {
            this_.showSystemMsg("网络异常,请检查网络！");
          }
        })

      }
    ).catch(err => {

    });
  }


  showSystemMsg(msg: string) {
    let alert = this.alertCtrl.create({
      title: '系统通知',
      subTitle: msg,
      buttons: ['好']
    });
    alert.present();
  }


}
