import {Component} from '@angular/core';
import {AlertController, NavController, ModalController, NavParams} from 'ionic-angular';
import {HttpStorage} from '../../providers/httpstorage';
import {ExamPage} from '../exam/exam';
import {NullPage} from '../null/null';
import {RecordPage} from '../record/record';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'page-simu',
  templateUrl: 'simu.html'
})
export class SimuPage {
  title: string;
  subject: any;
  t1: any;
  t2: any;
  tt: any;
  exam: any;
  allSimuExams: any;
  notes: any;
  nullpage: any;
  record: { date: number, time: number, list: Array<{ id: number, sb: number }> };

  constructor(public alertCtrl: AlertController, public modalCtrl: ModalController,public storage: Storage, public httpstorage: HttpStorage, public navCtrl: NavController, public navParams: NavParams) {
    this.nullpage = NullPage;
    this.title = this.navParams.get("title");
    this.subject = this.navParams.get("subject");
    this.tt = [];
    this.httpstorage.getStorage("s" + this.subject.id + "i1", (data) => {
      if (data != null) {
        for (let v of data.exam) {
          this.tt.push(v);
        }
      }
    })
    this.httpstorage.getStorage("s" + this.subject.id + "i2", (data) => {
      if (data != null) {
        for (let v of data.exam) {
          this.tt.push(v);
        }
      }
    })
  }

  open() {
    let modal = this.modalCtrl.create(RecordPage, {title: this.title, subject: this.subject, exams: this.tt});
    modal.present();
  }

  get() {
    if (this.tt.length == 0) {
      let prompt = this.alertCtrl.create({
        title: '系统通知',
        message: "请先进入核心考点/章节练习更新题库！",
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
    else {
      this.exam = [];
      this.record = {date: 0, time: 0, list: []};
      this.tt.sort((a, b) => {
        return Math.random() > 0.5 ? -1 : 1;
      })
      this.httpstorage.getStorage("s" + this.subject.id + "s", (data) => {
        if (data != null) {
          let totalTime = data.totalTime;
          let type = 0;
          let i = 0;
          for (let v of data.questions) {
            if (type != v.examType) i = 0;
            for (let j = i; j < this.tt.length; j++) {
              let w = this.tt[j];
              if (w.type == v.examType) {
                w.sb = v.point;
                w.done = 0;
                w.set = "";
                //this.exam.push(w);
                //this.record.list.push({id:w.id,sb:w.sb});
                this.record.list.push(w);
                i = j + 1;
                type = v.examType;
                break;
              }
            }
          }
          this.record.date = new Date().getTime();
          this.record.time = totalTime;
          //模拟考场
          this.httpstorage.getStorage("s" + this.subject.id + "r", (data) => {
            if (data == null) {
              data = [];
            }
            data.push(this.record);
            this.allSimuExams = data;
            this.httpstorage.setStorage("s" + this.subject.id + "r", this.allSimuExams);
            this.navCtrl.push(ExamPage, {
              subject: this.subject,
              title: this.title,
              moduleType: 3,
              exams: this.allSimuExams[this.allSimuExams.length - 1].list,
              saveQuestionRecord: this.saveQuestionRecord.bind(this),
              mode: false,
              time: totalTime
            });
          });
        }
        else {
          let prompt = this.alertCtrl.create({
            title: '系统通知',
            message: "未设置该课程组卷策略！",
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
      })
    }
  }

  saveQuestionRecord() {
    var this_ = this;
    setTimeout(function () {
      this_.storage.set("s" + this_.subject.id + "r", this_.allSimuExams).then((data) => {
      }).catch((err) => {
      })
    }, 500);
  }
}
