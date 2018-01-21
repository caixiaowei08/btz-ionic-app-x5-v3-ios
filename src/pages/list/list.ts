import {Component} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController, NavParams} from 'ionic-angular';
import {ListsPage} from '../lists/lists';
import {ExamPage} from '../exam/exam';
import {NullPage} from '../null/null';
import {HttpStorage} from '../../providers/httpstorage';
import * as $ from "jquery";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  subject: any;
  title: string;
  test: any;
  type: any;
  loader: any;

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public modalCtrl: ModalController, public navCtrl: NavController, public navParams: NavParams, public httpstorage: HttpStorage) {
    this.subject = this.navParams.get('subject');
    this.title = this.navParams.get('title');
    this.test = null;
    this.type = this.navParams.get('type') + 1;
    this.loader = this.loadingCtrl.create({
      content: "请耐心等待10秒钟哦...",
      showBackdrop: false
    });
    this.loader.present();
    this.getSubsItem(this.subject, this.type);
  }

  downdata(id, type, moduleType, version) {
    this.httpstorage.getHttp('/app/appExerciseController.do?getModuleExerciseByCourseIdAndModuleType&subCourseId=' + id + '&moduleType=' + moduleType, (data) => {
      //更新本地数据，并加载
      if (data.returnCode) {
        this.test = data.content;
        this.httpstorage.setStorage("s" + id + "i" + type, data.content);
        this.httpstorage.setStorage("s" + id + "i" + type + "v", version);//更新版本号
      }
      this.loader.dismiss();
    })
  }

  //特别的，版本更新时，核对数据
  checkdata(id, type, moduleType, version) {
    this.httpstorage.getStorage("s" + id + "i" + type, (data) => {
      //首先查看本地数据，如果没有，则直接网络数据覆盖
      if (data == null) this.downdata(id, type, moduleType, version);
      else {//否则对比两方的数据,同步老数据
        let tmp = data.exam;
        this.httpstorage.getHttp('/app/appExerciseController.do?getModuleExerciseByCourseIdAndModuleType&subCourseId=' + id + '&moduleType=' + moduleType, (data) => {
          if (data.returnCode) {
            let newData = data.content;
            for (let a of newData.exam) {
              for (let b of tmp) {
                if (a.id == b.id) {
                  a.done = b.done;
                  a.get = b.get;
                  a.set = b.set;
                  break;
                }
              }
            }
            this.test = newData;
            this.httpstorage.setStorage("s" + id + "i" + type, newData);
            this.httpstorage.setStorage("s" + id + "i" + type + "v", version);//更新版本号
          }
          this.loader.dismiss();
        })
      }
    })
  }

  getSubsItem(subject: any, type: any) {
    //this.subsItemFlg=[true,true,true,true];
    //!this.subsItem=[null,null,null,null];
    let id = subject.id;
    let moduleType;
    //let time=subject.time,currentTime=new Date().getTime();
    switch (type) {
      case 1:
        moduleType = 1;
        break;
      case 2:
        moduleType = 2;
        break;
      case 3:
        moduleType = 3;
        break;
      case 4:
        moduleType = 4;
        break;
      case 5:
        moduleType = 7;
        break;
      default:
        moduleType = 0;
        break;
    }
    //this.setSubsItem(null,type);
    //if(time!=0&&time<currentTime) this.setSubsItem(0,type);
    //else
    if (id != 0) {
      //核对版本号
      this.httpstorage.getStorage("s" + id + "i" + type + "v", (data) => {
        if (data != null) { //本地已经有版本数据了
          let tmp = data;
          console.log("local:" + tmp)
          this.httpstorage.getHttp('/app/appModuleController.do?getModuleBySubCourseIdAndModuleType&subCourseId=' + id + '&moduleType=' + moduleType, (data) => {
            if (data != null) { //有网
              if (data.returnCode) { //有数据
                if (tmp != data.content.versionNo) { //版本不同，更新
                  this.checkdata(id, type, moduleType, data.content.versionNo);
                }
                else {//版本相同，先从本地加载
                  this.httpstorage.getStorage("s" + id + "i" + type, (data) => {
                    //本地有保存
                    if (data != null) {
                      this.test = data;
                      this.loader.dismiss();
                    }
                    else {//本地无保存
                      this.downdata(id, type, moduleType, tmp);
                    }
                  })
                }
              }
              else { //无数据,同步，删除本地文件
                this.httpstorage.delStorage("s" + id + "i" + type + "v");
                this.httpstorage.delStorage("s" + id + "i");
                this.loader.dismiss();
              }
            }
            else {//无网，从本地加载
              this.httpstorage.getStorage("s" + id + "i" + type, (data) => {
                this.test = data;
                this.loader.dismiss();
              })
            }
          })
        }
        else {
          //本地无保存，从网下载
          this.httpstorage.getHttp('/app/appModuleController.do?getModuleBySubCourseIdAndModuleType&subCourseId=' + id + '&moduleType=' + moduleType, (data) => {
            //有网
            if (data != null) {
              if (data.returnCode) {//有数据
                //获取内容并保存
                console.log("list,6")
                this.downdata(id, type, moduleType, data.content.versionNo);
              }
              else {//无数据
                this.loader.dismiss();
              }
            }
            else {//无网
              this.loader.dismiss();
            }
          })
        }
      })
    }
  }

  ionViewDidLoad() {
    $("#listtoggle").on("click", "h1>.cb", function () {
      //$(this).parent("h1").toggleClass("h1x");
      $(this).toggleClass("cbx");
      $(this).nextAll("h2").toggle();
    })
    $("#listtoggle").on("click", "h2>.cb", function () {
      $(this).toggleClass("cbx");
      $(this).nextAll("h3").toggle();
    })
    $("#listtoggle").on("click", "h1>.tj", function () {
      //$(this).parent("h1").toggleClass("h1x");
      $(this).prev(".cb").toggleClass("cbx");
      $(this).nextAll("h2").toggle();
    })
    $("#listtoggle").on("click", "h2>.tj", function () {
      $(this).prev(".cb").toggleClass("cbx");
      $(this).nextAll("h3").toggle();
    })
  }

  done: number;

  donef(beg: number, all: number): number {
    this.done = 0;
    let tmp = this.test.exam;
    for (var i = beg; i < beg + all; i++) {
      if (tmp[i].done > 0) this.done++;
    }
    return this.done;
  }

  /*
  callback = (params) =>{
    return new Promise((resolve, reject)=>{
      this.test.exam=params;
      resolve();
    })
  }
  */
  choose(beg: number, all: number, tit: string, tryOut: any) {
    if (tryOut || (this.subject.exam && this.subject.time >= new Date().getTime())) {
      if (this.type == 1 || this.type == 2) {
        let modal = this.modalCtrl.create(ListsPage, {
          subject: this.subject,
          saveQuestionRecord: this.saveQuestionRecord.bind(this),
          title: tit,
          exams: this.test.exam,
          beg: beg,
          all: all
        });
        modal.present();
      }
      else {
        let exam = [];
        this.httpstorage.getStorage("s" + this.subject.id + "s", (data) => {
          let totalTime = 10;
          if (data != null) {
            totalTime = data.totalTime;
            for (let i = beg; i < beg + all; i++) {
              for (let w of data.questions) {
                if (this.test.exam[i].type == w.examType) {
                  this.test.exam[i].sb = w.point;
                  break;
                }
              }
              exam.push(this.test.exam[i]);
            }
          }
          else {
            for (let i = beg; i < beg + all; i++) {
              this.test.exam[i].sb = 1;
              exam.push(this.test.exam[i]);
            }
          }
          this.navCtrl.push(ExamPage, {
            subject: this.subject,
            title: this.title,
            exams: exam,
            mode: false,
            time: totalTime
          });
        });
      }
    }
    else {
      let prompt = this.alertCtrl.create({
        title: '系统通知',
        message: "完整获取该内容，请购买会员或续期！",
        buttons: [
          {
            text: '好',
            handler: data => {
            }
          }
        ]
      });
      prompt.present();
    }
    //this.navCtrl.push(ExamPage,{subject:this.subject,title:tit,exams:this.test.exam,beg:beg,all:all});
  }

  clear() {
    let prompt = this.alertCtrl.create({
      title: '系统通知',
      message: "清空后将无法恢复，你确定么？",
      buttons: [
        {
          text: '确定',
          handler: data => {
            for (let v of this.test.exam) {
              v.done = 0;
              v.set = "";
            }
            this.saveQuestionRecord();
          }
        },
        {
          text: '取消',
          handler: data => {
          }
        }
      ]
    });
    prompt.present();
  }

  ionViewWillUnload() {
    if (this.type == 1 || this.type == 2) this.httpstorage.setStorage("s" + this.subject.id + "i" + this.type, this.test);
  }

  saveQuestionRecord() {
    var this_ = this;
    setTimeout(function () {
      if (this_.type == 1 || this_.type == 2) {
        this_.httpstorage.setStorage("s" + this_.subject.id + "i" + this_.type, this_.test);
      }
    }, 500);
  }

}
