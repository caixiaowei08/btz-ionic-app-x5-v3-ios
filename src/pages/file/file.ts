import { Component } from '@angular/core';
import { ModalController,NavController, NavParams} from 'ionic-angular';
import { File } from '@ionic-native/file';
import { HttpStorage } from '../../providers/httpstorage';
import { NullPage } from '../null/null';
import { PlayPage } from '../play/play';
import * as $ from "jquery";

@Component({
  selector: 'page-file',
  templateUrl: 'file.html'
})
export class FilePage {
  video:Array<{id:string,time:string,tit:string}>;
  url:any;
  si:any;
  constructor(public modalCtrl:ModalController,public navCtrl: NavController,public navParams: NavParams,public file:File,public httpstorage:HttpStorage) {
    this.video=null;
    this.si=0;
    this.httpstorage.getStorage("vd",(data)=>{
      if(data==null){
        data=[];
        this.httpstorage.setStorage("vd",data);
      }
      this.video=data;
      console.log(this.video);
    })
  }
  getDate(i){
    let date=new Date(this.video[i].time);
    let h=date.getHours();
    let hh=h<10?"0"+h:h;
    let m=date.getMinutes();
    let mm=m<10?"0"+m:m;
    let s=date.getSeconds();
    let ss=s<10?"0"+s:s;
    return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+"  "+hh+":"+mm+":"+ss;
  }

  setUrl(i){
    this.si=i;
    //this.url=this.file.dataDirectory+this.video[i].id+".mp4";
    this.url=this.file.dataDirectory+this.video[i].id+".mp4";
    this.url =  this.url.replace("file://","");
    let modal=this.modalCtrl.create(PlayPage,{url:this.url,title:this.video[i].tit});
    modal.present();
  }

  delete(i){
    let id=this.video[i].id;
    this.file.removeFile(this.file.dataDirectory,id+'.mp4');
    this.video.splice(i,1);
    this.httpstorage.setStorage("vd",this.video);
  }

  ionViewDidEnter(){

  }
}
