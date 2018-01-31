import {Component} from '@angular/core';
import {ViewController, NavController, NavParams} from 'ionic-angular';
import {HttpStorage} from '../../providers/httpstorage';
import {ExamPage} from '../exam/exam';
import {NullPage} from '../null/null';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'page-record',
  templateUrl: 'record.html'
})

export class RecordPage {
  title: any;
  subject: { id: number, name: string }
  exams: any;
  exam: any;
  allSimuExams: any;
  nullpage: any;
  record: any;

  constructor(public viewCtrl: ViewController, public httpstorage: HttpStorage, public storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
    this.nullpage = NullPage;
    this.title = this.navParams.get("title");
    this.subject = this.navParams.get("subject");
    this.exams = this.navParams.get("exams");
    this.record = [];
    this.httpstorage.getStorage("s" + this.subject.id + "r", (data) => {
      if (data !== null) {
        this.allSimuExams = data;
        //排序
        this.record = this.allSimuExams.sort((a, b) => {
          return b.date - a.date;
        });
      }
    });
    this.exam = [];
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getDate(i) {
    let date = new Date(this.record[i].date);
    let h = date.getHours();
    let hh = h < 10 ? "0" + h : h;
    let m = date.getMinutes();
    let mm = m < 10 ? "0" + m : m;
    let s = date.getSeconds();
    let ss = s < 10 ? "0" + s : s;
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "  " + hh + ":" + mm + ":" + ss;
  }

  choose(i) {
    this.navCtrl.push(ExamPage, {
      subject: this.subject,
      title: this.title,
      exams: this.record[i].list,
      moduleType: 3,
      mode: false,
      saveQuestionRecord: this.saveQuestionRecord.bind(this),
      time: this.record[i].time
    }).then(() => {
      this.dismiss()
    });
  }


  saveQuestionRecord() {
    var this_ = this;
    setTimeout(function () {
      this_.storage.set("s" + this_.subject.id + "r", this_.record).then((data) => {
      }).catch((err) => {
      })
    }, 500);
  }


}
