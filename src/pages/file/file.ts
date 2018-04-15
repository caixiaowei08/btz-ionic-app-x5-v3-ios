import { Component } from '@angular/core';
import { ModalController,NavController, NavParams,ToastController} from 'ionic-angular';
import { File } from '@ionic-native/file';
import { HttpStorage } from '../../providers/httpstorage';
import { NullPage } from '../null/null';
import { PlayPage } from '../play/play';
import {Storage} from '@ionic/storage';

declare let cordova:any;

@Component({
  selector: 'page-file',
  templateUrl: 'file.html'
})
export class FilePage {

  videoList:any;
  url:any;

  constructor(public modalCtrl:ModalController,public navCtrl: NavController,public navParams: NavParams,public file:File,public httpstorage:HttpStorage,public toastCtrl:ToastController,public storage:Storage) {
     this.videoList = [];
     this.loadLocalVideoFile();
  }

  // ionViewDidEnter(){
  //   let this_ = this;
  //   this_.loadLocalVideoFile();
  // }

  loadLocalVideoFile(){
    let this_ = this;
    console.log("---loadLocalVideoFile---");
    cordova.plugins.CordovaFileTransfer.findVideoList(this_.file.dataDirectory.replace("file://",""), (data) => {
      this_.videoList = data;
      for(let i = 0;i<this_.videoList.length;i++ ){
        let videoItemInfo  =  this_.videoList[i];
        this_.storage.get("videoInfoItem"+videoItemInfo.id).then((videoInfoItemData)=>{
          if(videoInfoItemData!=null){
            videoItemInfo.fileName = videoInfoItemData.title;
          }
        });
      }
    }, (error) => {
    });
  }

  playVideo(videoDir:string,videoName:string){
    let this_ = this;
    this_.url=this_.file.dataDirectory.replace("file://","")+videoDir+".mp4";
    let modal=this.modalCtrl.create(PlayPage,{url:this_.url,title:videoName});
    modal.present();
  }

  delete(fileId: string) {
    let this_ = this;
    cordova.plugins.CordovaFileTransfer.delete(fileId.replace(".mp4", "").toString(), "", this_.file.dataDirectory.replace("file://",""), (data) => {
      this_.presentToast("删除成功！");
      this_.loadLocalVideoFile();
    }, (error) => {
      if (error == "downloading") {
        this_.presentToast("该视频正在下载，请先暂停，再删除！");
      } else if (error == "exception") {
        this_.presentToast("删除失败，请重试！");
      } else {
        this_.presentToast("未知异常，请联系客服！");
      }
      this_.loadLocalVideoFile();
    });
  }

  presentToast(msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }


}
