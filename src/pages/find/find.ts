import { Component } from '@angular/core';
import { AlertController,NavController,ToastController, NavParams} from 'ionic-angular';
import { HttpStorage } from '../../providers/httpstorage';
import * as $ from "jquery";

@Component({
  selector: 'page-find',
  templateUrl: 'find.html'
})
export class FindPage {
  subject:any;
  target:any;
  items:any;
  constructor(public toastCtrl:ToastController,public navCtrl: NavController,public navParams: NavParams,public httpstorage:HttpStorage) {
    this.target="";
    this.items=[];
    this.httpstorage.getStorage("subject",(data)=>{
      this.subject=data;
    })
  }
  getItems(ev: any){
    let val = $(".searchbar-input")[0].value;
    if (val && val.trim() != '') {
      this.items=[];
      this.httpstorage.getStorage("s"+this.subject.id+"i1",(data)=>{
        if(data!=null)
        for(let e of data.exam){
          if(e.title.indexOf(val)>=0) this.items.push(e);
        }
        this.httpstorage.getStorage("s"+this.subject.id+"i2",(data)=>{
          if(data!=null)
          for(let e of data.exam){
            if(e.title.indexOf(val)>=0) this.items.push(e);
          }
          this.httpstorage.getStorage("s"+this.subject.id+"i4",(data)=>{
            if(data!=null)
            for(let e of data.exam){
              if(e.title.indexOf(val)>=0) this.items.push(e);
            }
            if(this.items.length==0){
              let toast = this.toastCtrl.create({
                message: '未搜索到相关内容',
                duration:2000,
                position:'bottom'
              });
              toast.present();
            }
          });
        });
      })
      //this.getSubs(val,1);
      //this.getSubs(val,2);
    }else{
      if(this.items.length==0){
        let toast = this.toastCtrl.create({
          message: '请输入题目关键词，再进行搜索！',
          duration:2000,
          position:'bottom'
        });
        toast.present();
      }
    }
  }
  /*
  getSubs(s,n){
    this.httpstorage.getStorage("s"+this.subject.id+"i"+n,(data)=>{
      for(let e of data.exam){
        if(e.title.indexOf(s)>=0) this.items.push(e);
      }
    })
  }
  */
}
