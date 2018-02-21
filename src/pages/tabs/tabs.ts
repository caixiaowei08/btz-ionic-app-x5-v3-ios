import {Component, ViewChild} from '@angular/core';
import {HomePage} from '../home/home';
import {LivePage} from '../live/live';
import {MinePage} from '../mine/mine';
import {NavParams, NavController, Tabs, AlertController} from 'ionic-angular'
import {Storage} from "@ionic/storage";
import {PhonePage} from "../phone/phone";


@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;

  comeFrom: string = "";
  tabsSelect: string = "";

  @ViewChild('btzTabs') tabRef: Tabs;

  //params:any;
  constructor(public navParams: NavParams, public storage: Storage, public navCtrl: NavController, public alertCtrl: AlertController) {
    this.tab1Root = HomePage;
    this.tab2Root = LivePage;
    this.tab3Root = MinePage;
    //this.params={ref:true};

    this.comeFrom = this.navParams.get("comeFrom");
    this.tabsSelect = this.navParams.get("tabsSelect");

    //来自登录页面跳转过来 判断手机绑定情况
    if (this.comeFrom !== undefined && this.comeFrom === 'loginPage') {
      this.storage.get("user").then((user) => {
        let userPhoneNo = user.phoneNo;
        if (userPhoneNo === undefined || userPhoneNo === null || userPhoneNo.length !== 11) {
          this.tabRef.select(2);
          let prompt = this.alertCtrl.create({
            title: '提示',
            subTitle: '您的账号尚未绑定手机号，是否现在绑定?',
            buttons: [
              {
                text: '暂且不要',
                handler: data => {
                  //do nothig
                }
              }, {
                text: '现在绑定',
                handler: data => {
                  this.navCtrl.push(PhonePage);
                }
              }
            ]
          });
          prompt.present();
        }
      })
    }
  }
}
