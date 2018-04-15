import {Component} from '@angular/core';
import {NavController, NavParams, AlertController, ToastController} from 'ionic-angular';
import {File} from '@ionic-native/file';
import {DomSanitizer} from '@angular/platform-browser';
import * as $ from "jquery";
import {Storage} from '@ionic/storage';
declare let cordova: any;

@Component({
  selector: 'page-video',
  templateUrl: 'video.html'
})

export class VideoPage {
  seg: any;
  subject: any;
  title: string;
  currentVideoIndexI: number;//当前视频记录的序号1
  currentVideoIndexJ: number;//当前视频记录的序号2
  videos: any;
  //当前播放的视频链接
  currentVideoUrl: string;
  //当前播放的视频对应的讲义
  currentLectureUrl: any;
  currentVideoItem: any;
  currentPlayVideoItemId: number = -1;
  playSaveCurrentFlag: boolean = false;

  constructor(public navParams: NavParams, private sanitizer: DomSanitizer, public file: File, public alertCtrl: AlertController, private toastCtrl: ToastController, private storage: Storage) {
    this.seg = "s1";
    this.subject = this.navParams.get('subject');
    this.videos = this.navParams.get('videos');
    this.title = "返回";
    this.currentVideoIndexI = 0;
    this.currentVideoIndexJ = 0;
  }

  //进入页面初始化
  ionViewDidEnter() {
    let this_ = this;
    this_.onProgress();
    this_.initAllVideoState();
  }

  //所有的下载进程进行监控
  onProgress() {
    let this_ = this;
    cordova.plugins.CordovaFileTransfer.onProgress((result) => {
      if (result.state == 0) {
        $("#" + result.id).removeClass().addClass("video-jdt");
        $("#" + result.id).children("div").css("width", result.loaded * 100 / result.total + "%").html("<p>等待</p>");
      } else if (result.state == 1) {
        $("#" + result.id).removeClass().addClass("video-jdt");
        $("#" + result.id).children("div").css("width", result.loaded * 100 / result.total + "%").html("<p>" + (result.loaded * 100 / result.total).toFixed(0) + "%</p>");
      } else if (result.state == 2) {
        $("#" + result.id).removeClass().addClass("video-jdt");
        $("#" + result.id).children("div").css("width", result.loaded * 100 / result.total + "%").html("<p>已下载</p>");
      } else if (result.state == 4) {
        $("#" + result.id).removeClass().addClass("video-jdt");
        $("#" + result.id).children("div").css("width", result.loaded * 100 / result.total + "%").html("<p style='color:red;'>error</p>");
        this_.presentToast("error:" + result.msg);
      }
    }, (error) => {
      console.log(error);
    });
  }

  initAllVideoState() {
    let this_ = this;
    this_.storage.get("currentPlayVideoItemId").then((data) => {
      if (data != null) {
        this_.currentPlayVideoItemId = data;
      }
      for (let i = 0; i < this_.videos.length; i++) {
        for (let j = 0; j < this_.videos[i].list.length; j++) {
          let videoItem = this_.videos[i].list[j];
          this_.storage.set("videoInfoItem"+videoItem.id,videoItem).then(data=>{}).catch((err)=>{});//保存视频数据到手机 给后面的下载视频 配置视频名称
          //初始化播放状态
          this_.storage.get("videoPlayTimeRecord" + videoItem.id).then((data) => {
            if (data != null) {
              videoItem.currentTime = data.currentTime;
              videoItem.duration = data.duration;
            } else {
              videoItem.currentTime = 0;
              videoItem.duration = 0;
            }
          }, (error) => {
            //播放状态
          });

          cordova.plugins.CordovaFileTransfer.checkVideoItemState(videoItem.id.toString(), this_.file.dataDirectory.replace("file://",""), (result) => {
            if (result == "download") {//正在下载
              //donothing 监控来做
            } else if (result == "wait") {//等待
              //donothing 监控来做
            } else if (result == "done") {//已下载
              $("#" + videoItem.id).removeClass().addClass("video-jdt");
              $("#" + videoItem.id).children("div").css("width", 100 + "%").html("<p>已下载</p>");
            } else if (result == "stop") {//暂停
              $("#" + videoItem.id).removeClass().addClass("video-jdt");
              $("#" + videoItem.id).children("div").css("width", 0 + "%").html("<p>暂停</p>");
            } else if (result == "none") {//未下载
              $("#" + videoItem.id).removeClass().addClass("video-down");
            }
          }, (error) => {
            //do nothing
            this_.presentToast("获取视频状态错误！")
          });

          if (videoItem.id == this_.currentPlayVideoItemId) {
            this_.currentVideoIndexI = i;
            this_.currentVideoIndexJ = j;
          }
        }
      }
      this_.currentVideoItem = this_.videos[this_.currentVideoIndexI].list[this_.currentVideoIndexJ];
      cordova.plugins.CordovaFileTransfer.checkFileIsExist(this_.currentVideoItem.id.toString(), this_.file.dataDirectory.replace("file://",""), (result) => {
        this_.title = this_.currentVideoItem.title;
        this_.playSaveCurrentFlag = false;
        if (result === "Y") {//播放本地视频
          this_.currentVideoUrl = this_.file.dataDirectory.replace("file://", "") + this_.currentVideoItem.id + ".mp4";
        } else {
          this_.currentVideoUrl = this_.currentVideoItem.videoUrl;
        }
        this_.currentLectureUrl = this_.sanitizer.bypassSecurityTrustResourceUrl(this_.currentVideoItem.lectureUrl == null ? '' : this_.currentVideoItem.lectureUrl);
        setTimeout(function () {
          this_.storage.get("videoPlayTimeRecord" + this_.currentVideoItem.id).then((data) => {
            if (data != null && data.currentTime > 0) {
              $("#video")[0].currentTime = (data.currentTime - 10 > 0) ? data.currentTime - 10 : 0;
            }
            this_.playSaveCurrentFlag = true;
          }).catch((error) => {
            this_.playSaveCurrentFlag = true;
          });
          //$("#video")[0].play();
        }, 1000);
      }, (error) => {

      });
    }, (error) => {
      //current
    });
  }

  playVideo(i: number, j: number) {
    let this_ = this;
    //显示
    this_.currentVideoIndexI = i;
    this_.currentVideoIndexJ = j;
    this_.currentVideoItem = this_.videos[this_.currentVideoIndexI].list[this_.currentVideoIndexJ];
    this_.playSaveCurrentFlag = false;
    cordova.plugins.CordovaFileTransfer.checkFileIsExist(this_.currentVideoItem.id.toString(), this_.file.dataDirectory.replace("file://",""), (result) => {
      if (result === "Y") {//播放本地视频
        this_.currentVideoUrl = this_.file.dataDirectory.replace("file://", "") + this_.currentVideoItem.id + ".mp4";
      } else {
        this_.currentVideoUrl = this_.currentVideoItem.videoUrl;
      }
      this_.currentLectureUrl = this_.sanitizer.bypassSecurityTrustResourceUrl(this_.currentVideoItem.lectureUrl == null ? '' : this_.currentVideoItem.lectureUrl);
      this_.title = this_.currentVideoItem.title;
      this_.storage.set("currentPlayVideoItemId", this_.currentVideoItem.id).then((data) => {
        //do nothing
      }).catch((error) => {
          //do nothing
        }
      );
        setTimeout(function () {
          this_.storage.get("videoPlayTimeRecord" + this_.currentVideoItem.id).then((data) => {
            if (data != null && data.currentTime > 0) {
              $("#video")[0].currentTime = (data.currentTime - 10 > 0) ? data.currentTime - 10 : 0;
            }
            this_.playSaveCurrentFlag = true;
          }).catch((error) => {
            this_.playSaveCurrentFlag = true;
          });
          $("#video")[0].play();
        }, 1000);
    }, (error) => {
      this_.showMsg("播放错误code：10001");
    });
  }

  download(i: number, j: number) {
    let this_ = this;
    let videoDownload = this_.videos[i].list[j];
    cordova.plugins.CordovaFileTransfer.download(videoDownload.id.toString(), videoDownload.videoUrl, this_.file.dataDirectory.replace("file://",""), (result) => {
      this_.presentToast("已添加到下载队列！");
    }, (error) => {
      if (error == "exist") {
        cordova.plugins.CordovaFileTransfer.stop(videoDownload.id.toString(), (result) => {
          $("#" + videoDownload.id).removeClass().addClass("video-jdt");
          $("#" + videoDownload.id).children("div").css("width", 0 + "%").html("<p>暂停</p>");
        }, (error) => {
          this_.presentToast("暂停异常，请重试！");
        });
      } else if (error == "fileExist") {
        $("#" + videoDownload.id).removeClass().addClass("video-jdt");
        $("#" + videoDownload.id).children("div").css("width", 100 + "%").html("<p>已下载</p>");
      } else if (error == "exception") {
        this_.presentToast("未知异常，请重试！");
      }
    });
  }

  videoPlayTimeUpdate(event) {
    //记录当前进度
    let this_ = this;
    this_.currentVideoItem.duration = event.target.duration;
    this_.currentVideoItem.currentTime = event.target.currentTime;

    if (this.playSaveCurrentFlag && event.target.currentTime > 1 && event.target.currentTime % 5 > 4.8) {
      this_.storage.set("videoPlayTimeRecord" + this_.currentVideoItem.id, this_.currentVideoItem).then((data) => {
      }).catch((error) => {
      });
    }

  }

  deleteVideoFile(i: number, j: number) {
    let this_ = this;
    let videoDownload = this_.videos[i].list[j];
    cordova.plugins.CordovaFileTransfer.delete(videoDownload.id.toString(), videoDownload.videoUrl, this_.file.dataDirectory.replace("file://",""), (result) => {
      this_.presentToast("删除成功！");
      $("#" + videoDownload.id).removeClass().addClass("video-down");
    }, (error) => {
      if (error == "downloading") {
        this_.presentToast("该视频正在下载，请先暂停，再删除！");
      } else if (error == "exception") {
        this_.presentToast("删除失败，请重试！");
      } else {
        this_.presentToast("未知异常，请联系客服！");
      }
    });
  }

  toggleSubList(i: number) {
    $(".video-title").eq(i).children(".cb").toggleClass("cbx");
    $(".video-title").eq(i).nextAll().toggle();
  }

  showMsg(msg) {
    let alert = this.alertCtrl.create({
      title: '系统通知',
      subTitle: msg,
      buttons: ['好'],
    });
    alert.present();
  }

  formatSeconds(value) {
    if (isNaN(value)) return '00:00';
    var theTime = parseInt(value);// 秒
    var theTime1 = 0;// 分
    var theTime2 = 0;// 小时
    if (theTime > 60) {
      theTime1 = parseInt(theTime / 60 + "");
      theTime = parseInt(theTime % 60 + "");
      if (theTime1 > 60) {
        theTime2 = parseInt(theTime1 / 60 + "");
        theTime1 = parseInt(theTime1 % 60 + "");
      }
    }
    var result = "00:" + (theTime < 10 ? '0' + theTime : theTime);
    if (theTime1 > 0) {
      result = "" + (theTime1 < 10 ? '0' + theTime1 : theTime1) + ":" + (theTime < 10 ? '0' + theTime : theTime);
    }
    if (theTime2 > 0) {
      result = theTime2 + ":" + (theTime1 < 10 ? '0' + theTime1 : theTime1) + ":" + (theTime < 10 ? '0' + theTime : theTime);
    }
    return result;
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


  isOk(video) {
    //课程的权限
    let this_= this;
    if (video.tryOut || (this_.subject.videoClass !== undefined && this_.contains(this.subject.videoClass, video.authId) && this_.subject.time >= new Date().getTime())) {
      return true;
    } else {
      return false;
    }
  }

  /*包含权限*/
  contains(av, v) {
    for (var i = 0; i < av.length; i++) {
      if (av[i] == v) {
        return true;
      }
    }
    return false;
  };


}


