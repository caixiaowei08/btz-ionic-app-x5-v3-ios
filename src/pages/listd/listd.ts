import {Component} from '@angular/core';
import {AlertController, ModalController, NavController, NavParams} from 'ionic-angular';
import {HttpStorage} from '../../providers/httpstorage';
import {ExamPage} from '../exam/exam';

import * as $ from "jquery";

@Component({
  selector: 'page-listd',
  templateUrl: 'listd.html'
})
export class ListDPage {
  subject: any;
  title: string;
  type: any;
  t1: any;
  t2: any;
  seg: any;
  exam: any;
  oexam: any;
  t1ok: any;
  t2ok: any;

  constructor(public alertCtrl: AlertController, public modalCtrl: ModalController, public navCtrl: NavController, public navParams: NavParams, public httpstorage: HttpStorage) {
    this.subject = this.navParams.get('subject');
    this.title = this.navParams.get('title');
    this.type = this.navParams.get('type');
    this.seg = "s1";
    this.exam = new Array();
    this.t1 = null;
    this.t2 = null;
    this.t1ok = false;
    this.t2ok = false;
    this.exam = [];
    this.httpstorage.getStorage("s" + this.subject.id + "i1", (data) => {
      this.t1 = data;
      this.t1ok = true;
    });
    this.httpstorage.getStorage("s" + this.subject.id + "i2", (data) => {
      this.t2 = data;
      this.t2ok = true;
    });
  }

  ionViewDidLoad() {
    $("#listdtoggle").on("click", "h1>.cb", function () {
      $(this).toggleClass("cbx");
      $(this).nextAll("h2").toggle();
    })
    $("#listdtoggle").on("click", "h2>.cb", function () {
      $(this).toggleClass("cbx");
      $(this).nextAll("h3").toggle();
    })
    $("#listdtoggle").on("click", "h1>.tj", function () {
      $(this).prev(".cb").toggleClass("cbx");
      $(this).nextAll("h2").toggle();
    })
    $("#listdtoggle").on("click", "h2>.tj", function () {
      $(this).prev(".cb").toggleClass("cbx");
      $(this).nextAll("h3").toggle();
    })
  }

  done: number;

  donef(beg: number, all: number) {
    this.done = 0;
    let tmp = this.seg == 's1' ? this.t1.exam : this.t2.exam;
    for (var i = beg; i < beg + all; i++) {
      if (this.type == 10) {
        if (tmp[i].done == 2 || (tmp[i].done > 0 && tmp[i].done < 1)) {
          this.done++;
        }
      }
      else {
        if (tmp[i].get > 0) {
          this.done++;
        }
      }
    }
    return this.done;
  }

  choose(beg: number, all: number, tit: string, tryOut: any) {
    if (tryOut || (this.subject.exam && this.subject.time >= new Date().getTime())) {
      this.exam = [];
      this.oexam = [];
      let tmp = this.seg == 's1' ? this.t1.exam : this.t2.exam;
      for (var i = beg; i < beg + all; i++) {
        if (this.type == 10) {//错题重做
          if (tmp[i].done == 2 || (tmp[i].done > 0 && tmp[i].done < 1)) {
            this.oexam.push({id: tmp[i].id, done: tmp[i].done, set: tmp[i].set})
            tmp[i].done = 0;
            tmp[i].set = "";
            this.exam.push(tmp[i]);
          }
        }
        else {//关注
          if (tmp[i].get > 0) {
            this.oexam.push({id: tmp[i].id, done: tmp[i].done, set: tmp[i].set});
            tmp[i].done = 0;
            tmp[i].set = "";
            this.exam.push(tmp[i]);
          }
        }
      }
      console.log("this.type:"+this.type);

      this.navCtrl.push(ExamPage, {
        subject: this.subject,
        title: tit,
        comeFrom: this.type === 10 ? 1 : 2,
        saveQuestionRecord: this.saveQuestionRecord.bind(this),
        exams: this.exam,
        moduleType: this.seg == 's1' ? 1 : 2,
        mode: false,
        time: 0
      });

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
  }

  ionViewDidEnter() {
    if (this.exam.length > 0) {
      for (let v of this.exam) {
        for (let w of this.oexam) {
          if (v.id == w.id) {
            if (v.done == 0 || v.done == 3) {
              v.done = w.done;
              v.set = w.set;
            }
            break;
          }
        }
      }
    }
  }

  //保存本地
  ionViewWillUnload() {

    if (this.t1ok) {
      this.httpstorage.setStorage("s" + this.subject.id + "i1", this.t1);
    }

    if (this.t2ok) {
      this.httpstorage.setStorage("s" + this.subject.id + "i2", this.t2);
    }

  }

  //保存
  saveQuestionRecord() {
        if (this.t1ok) {
          this.httpstorage.setStorage("s" + this.subject.id + "i1", this.t1);
        }

        if (this.t2ok) {
          this.httpstorage.setStorage("s" + this.subject.id + "i2", this.t2);
        }
  }

}
