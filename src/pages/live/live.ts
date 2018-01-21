import { Component } from '@angular/core';
import { ModalController,NavController, NavParams} from 'ionic-angular';
import { VideoPage} from '../video/video';
import { HttpStorage } from '../../providers/httpstorage';
import { FramePage } from '../frame/frame';
import { NullPage } from '../null/null';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';

@Component({
  selector: 'page-live',
  templateUrl: 'live.html'
})
export class LivePage {
  subject:any;
  seg:any;
  video:any;
  live:any;
  downqueue:any;
  fileTransfer:FileTransferObject;
  vd:any;
  constructor(public modalCtrl:ModalController,public navCtrl: NavController,public navParams: NavParams,private httpstorage:HttpStorage,private transfer: FileTransfer, private file: File) {
    this.subject={id:0,name:"",time:0};
    this.seg="s1";
    this.video=null;
    this.live=null;

    this.fileTransfer=this.transfer.create();
    this.downqueue=new Array();
    this.vd=new Array();
    this.httpstorage.getStorage("vd",(data)=>{
      if(data==null){
        data=[];
        this.httpstorage.setStorage("vd",data);
      }
      this.vd=data;
    })
  }
  choose(i,j){
    //let modal=this.modalCtrl.create(VideoPage,{subject:this.subject,videos:this.video[i].list[j].list,ft:this.fileTransfer,downqueue:this.downqueue,vd:this.vd})
    //modal.present();
    this.navCtrl.push(VideoPage,{subject:this.subject,videos:this.video[i].list[j].list,ft:this.fileTransfer,downqueue:this.downqueue,vd:this.vd});
  }
  goLive(i){
    this.navCtrl.push(FramePage,{title:this.live[i].title,url:this.live[i].videoUrl});
  }
  ionViewDidEnter(){
    this.httpstorage.getStorage("subject",(data)=>{
      this.subject=data;
      if(data.id!=0){
        this.httpstorage.getHttp('/app/appRecordedVideoController.do?getRecordedVideoListBySubCourseId&subCourseId='+this.subject.id,(data)=>{
          if(data!=null){ //有网
              if(data.returnCode) this.video=data.content;
              else this.video=[];
          }
          else this.video=[];
        })
        //获取直播列表
        this.httpstorage.getHttp('/app/appLiveVideoController.do?getLiveVideoListBySubCourseId&subCourseId='+this.subject.id,(data)=>{
          if(data!=null) {
            console.log(data.content);
            if(data.returnCode) this.live=data.content;
            else this.live=[];
          }
          else this.live=[];
        })
      }
    })
  }
}
