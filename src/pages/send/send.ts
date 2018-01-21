import { Component } from '@angular/core';
import { AlertController, NavController, NavParams} from 'ionic-angular';
import { HttpStorage } from '../../providers/httpstorage';
import * as $ from "jquery";

@Component({
  selector: 'page-send',
  templateUrl: 'send.html'
})
export class SendPage {
  seg:any;
  select:any;
  token:any;
  id:any;
  text:any;
  callback:any;
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
    this.callback=this.navParams.get("callback");
    this.text="";
  }
  ionViewDidLoad(){
    $(".darklayer").show();
  }
  ionViewWillUnload(){
    $(".darklayer").hide();
  }
  save(){
    this.httpstorage.postHttp('/app/appNotesController.do?doAdd&token='+this.token,JSON.stringify({exerciseId:this.id,notes:this.text}),(data)=>{
      if(data.returnCode){
        let alert = this.alertCtrl.create({
          title: '添加笔记',
          subTitle: '保存成功！',
          buttons: [{
            text:'好',
            handler: data => {
              this.navCtrl.pop().then(this.callback(""))
            }
          }]
        });
        alert.present();
      }
      else{
        let alert = this.alertCtrl.create({
          title: '添加笔记',
          subTitle: '保存失败！',
          buttons: ['好']
        });
        alert.present();
      }
    });
  }
  cancel(){
    this.navCtrl.pop();
  }
}
