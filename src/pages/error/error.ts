import { Component } from '@angular/core';
import { AlertController, NavController, NavParams} from 'ionic-angular';
import { HttpStorage } from '../../providers/httpstorage';
import * as $ from "jquery";

@Component({
  selector: 'page-error',
  templateUrl: 'error.html'
})
export class ErrorPage {
  seg:any;
  select:any;
  token:any;
  id:any;
  text:any;
  constructor(public alertCtrl: AlertController, public httpstorage:HttpStorage,public navCtrl: NavController,public navParams: NavParams) {
    this.seg=0;
    this.select=[
      "答案或解析错误",
      "错别字、符号",
      "题目不严谨",
      "试题陈旧、超纲",
      "其他"
    ]
    this.token=this.navParams.get("token");
    this.id=this.navParams.get("id");
    this.text="";
  }
  ionViewDidLoad(){
    $(".darklayer").show();
  }
  ionViewWillUnload(){
    $(".darklayer").hide();
  }
  close(){
    this.navCtrl.pop();
  }
  send(){
    this.httpstorage.postHttp("/app/feedbackController.do?doAdd&token="+this.token,JSON.stringify({exerciseId:this.id,content:this.select[this.seg]+" "+this.text}),(data)=>{
      if(data.returnCode){
        let alert = this.alertCtrl.create({
          title: '问题反馈',
          subTitle: '发送成功！',
          buttons: [{
            text:'好',
            handler: data => {
              this.navCtrl.pop();
            }
          }]
        });
        alert.present();
      }
      else{
        let alert = this.alertCtrl.create({
          title: '问题反馈',
          subTitle: '发送失败！',
          buttons: ['好']
        });
        alert.present();
      }
    });
  }
}
