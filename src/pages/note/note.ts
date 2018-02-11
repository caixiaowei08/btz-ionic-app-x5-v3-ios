import {Component} from '@angular/core';
import {ModalController, AlertController, NavController, NavParams} from 'ionic-angular';
import {HttpStorage} from '../../providers/httpstorage';
import {NullPage} from '../null/null';
import {ExamPage} from '../exam/exam';
import {SendPage} from '../send/send';
import * as $ from "jquery";

@Component({
  selector: 'page-note',
  templateUrl: 'note.html'
})
export class NotePage {
  subject: any;
  id: any;
  type: any;
  notes: any;
  token: any;
  nullpage: any;
  tt: any;
  callback: any;

  constructor(public modalCtrl: ModalController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public httpstorage: HttpStorage) {
    this.nullpage = NullPage;
    this.notes = null;
    this.subject = this.navParams.get("subject");
    this.id = this.navParams.get("id");
    this.type = this.navParams.get("type");
    this.httpstorage.getStorage("user", (data) => {
      this.token = data.token;
      this.getNote();
    });
    this.tt = [];
    if (this.type == 12) {
      this.httpstorage.getStorage("s" + this.subject.id + "i1", (data) => {
        if (data != null) {
          for (let v of data.exam) this.tt.push(v);
        }
      })
      this.httpstorage.getStorage("s" + this.subject.id + "i2", (data) => {
        if (data != null) {
          for (let v of data.exam) this.tt.push(v);
        }
      })
      this.httpstorage.getStorage("s" + this.subject.id + "i4", (data) => {
        if (data != null) {
          for (let v of data.exam) this.tt.push(v);
        }
      })
      this.httpstorage.getStorage("s" + this.subject.id + "i5", (data) => {
        if (data != null) {
          for (let v of data.exam) this.tt.push(v);
        }
      })
    }
    this.callback = (params) => {
      return new Promise((resolve, reject) => {
        this.getNote();
        resolve();
      })
    }
  }

  getNote() {
    //主目录
    if (this.type == 12) this.httpstorage.getHttp('/app/appNotesController.do?doGetNotesByTokenAndSubCourseId&token=' + this.token + '&subCourseId=' + this.subject.id, (data) => {
      if (data != null) {
        this.notes = data.content;
      }
    })
    else this.httpstorage.getHttp('/app/appNotesController.do?doGetNotesByExerciseIdAndToken&token=' + this.token + '&exerciseId=' + this.id, (data) => {
      if (data != null) {
        this.notes = data.content;
      }
    })
  }

  addNote() {
    let modal = this.modalCtrl.create(SendPage, {token: this.token, id: this.id, callback: this.callback});
    modal.present();
  }

  setZan(i, id) {
    this.httpstorage.getHttp('/app/appNotesController.do?doClickThumbsUp&token=' + this.token + '&id=' + id, (data) => {
      if (data != null && data.success == "success") {
        this.notes[i].thumbsUp = data.content;
      }
    })
  }

  goExam(id) {
    if (this.type == 12) {
      let exam = [];
      for (let v of this.tt) {
        if (v.id == id) {
          exam.push(v);
          break;
        }
      }
      this.navCtrl.push(ExamPage, {subject: '', title: "look", comeFrom: 2, exams: exam, mode: false, time: 0});
    }
  }
}
