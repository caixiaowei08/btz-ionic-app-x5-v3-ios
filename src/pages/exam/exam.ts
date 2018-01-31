import {Component} from '@angular/core';
import {ViewController, ModalController, AlertController, NavController, NavParams} from 'ionic-angular';
import {NullPage} from '../null/null';
import {NotePage} from '../note/note';
import {ScorePage} from '../score/score';
import {DtkPage} from '../dtk/dtk';
import {ErrorPage} from '../error/error';
import {HttpStorage} from '../../providers/httpstorage';
import {LoginPage} from '../../pages/login/login';

import * as $ from "jquery";

@Component({
  selector: 'page-exam',
  templateUrl: 'exam.html'
})
export class ExamPage {
  subject: { id: number, name: string }
  title: any;
  exams: any;
  all: any;
  /*保存试题的方法*/
  saveQuestionRecord: any;
  mode: any;
  time: any;
  timeM: any;
  /*当前显示的题目*/
  exam: any;
  id: any;
  allarr: any;
  nullpage: any;
  setDtk: any;
  token: any;
  jsq: any;
  moduleType: any;

  constructor(public viewCtrl: ViewController, public modalCtrl: ModalController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public httpstorage: HttpStorage) {
    this.subject = this.navParams.get('subject');
    this.title = this.navParams.get('title');
    this.exams = this.navParams.get('exams');
    this.mode = this.navParams.get('mode');
    this.moduleType = this.navParams.get("moduleType");
    this.saveQuestionRecord = this.navParams.get('saveQuestionRecord');
    this.time = this.navParams.get("time");
    if (this.mode != 2 && this.time == 0) {
      this.exams.sort((a, b) => {
        if (a.typeShow == b.typeShow) {
          return a.type - b.type;
        }
        else {
          return a.typeShow - b.typeShow;
        }
      });
    }
    this.timeM = "";
    if (this.time > 0) {
      let tmp = this.time * 60;
      let checkAll = this.checkAll.bind(this);
      this.getTime(tmp);
      let getTime = this.getTime.bind(this);
      this.jsq = setInterval(function () {
        if (tmp > 0) {
          tmp--;
          getTime(tmp);
        }
        else checkAll();
      }, 1000)
    }
    this.id = 0;
    this.exam = this.exams[this.id];
    this.all = this.exams.length;
    this.allarr = new Array(this.all);
    this.nullpage = NullPage;
    this.ans = true;
    this.httpstorage.getStorage("user", (data) => {
      this.token = data.token;
    });
    this.exam7 = new Array();
    for (let i = 0; i < 50; i++) {
      this.exam7[i] = new Array();
      for (let j = 0; j < 20; j++) {
        this.exam7[i][j] = "";
      }
    }
  }

  getTime(t) {
    let tmp = parseInt(t / 60 + "");
    let sec, se;
    if (tmp < 10) {
      sec = "0" + tmp;
    }
    else {
      sec = tmp + "";
    }
    tmp = t - tmp * 60;
    if (tmp < 10) {
      se = "0" + tmp;
    }
    else {
      se = tmp + "";
    }
    this.timeM = sec + " : " + se;
  }

  ans: boolean;

  getType() {
    if (this.mode) {
      this.ans = false;
    }

    if (this.exam.get) {
      this.get = true;
    }

    else {
      this.get = false;
    }

    if (this.exam.typeShow == 7) {
      this.getType7();
    }
    return this.exam.typeName;
  }

  getContentLength: any;

  getContent1() {
    let tmp = this.exam.content.split("<br/>");
    this.getContentLength = tmp.length;
    return tmp;
  }

  getContent2() {
    let tmp = this.exam.content.split("<br/><br/>");
    this.getContentLength = tmp.length;
    return tmp;
  }

  getContent2Sub(s: any) {
    return s.split("<br/>");
  }

  exam7: any;
  exam7ans: any;

  getContent3() {
    let tmp = this.exam.content.split("<br/><br/><br/>");
    this.getContentLength = tmp.length;
    return tmp;
  }

  getContent3Sub(s: any) {
    let tmp = s.split("<br/><br/>");
    this.exam7ans = tmp[1].split("<br/>");
    return tmp[0].split("<br/>");
  }

  getType7ans(s) {
    return s.split(".")[0];
  }

  getType7() {
    let tmp = this.exam.set.split("<br/>");
    for (let i = 0; i < 50; i++) {
      if (i < tmp.length) {
        for (let j = 0; j < 20; j++) {
          if (j < tmp[i].length) {
            this.exam7[i][j] = tmp[i][j];
          }
          else {
            this.exam7[i][j] = "";
          }
        }
      }
      else {
        for (let j = 0; j < 20; j++) {
          this.exam7[i][j] = "";
        }
      }
    }
  }

  setType7() {
    let res = "";
    for (let i = 0; i < this.getContentLength; i++) {
      let tmp = this.getContent3()[i].split("<br/><br/>")[0].split("<br/>");
      for (let j = 0; j < tmp.length; j++) {
        res += this.exam7[i][j];
      }
      if (i < this.getContentLength - 1) {
        res += "<br/><br/>";
      }
    }
    this.exam.set = res;
    if (this.exam.done > 0) {
      this.check();
    }
    this.saveQuestionRecord();
  }

  //单选题
  getType1(i: number) {
    if (String.fromCharCode(i + 65) != this.exam.set) {
      return '';
    }
    else {
      if (this.exam.done == 0) {
        return 'exam-botton-choose';
      }
      else {
        if (this.exam.set == this.exam.answer) {
          return 'exam-botton-right';
        }
        else {
          return 'exam-botton-wrong';
        }
      }
    }
  }

  setType1(i: number) {
    this.exam.set = String.fromCharCode(i + 65);
    if (this.exam.done > 0) {
      this.check();
    }
    this.saveSingleQuestionRecordByAppTokenAndExerciseId(this.exam);
    this.saveQuestionRecord();
  }

  //多选题
  getType2(i: number) {
    if (this.exam.set.indexOf(String.fromCharCode(i + 65)) < 0) {
      return '';
    }
    else {
      if (this.exam.done == 0) {
        return 'exam-botton-choose';
      }
      else {
        if (this.exam.set == this.exam.answer) {
          return 'exam-botton-right';
        }
        else {
          return 'exam-botton-wrong';
        }
      }
    }
  }

  bubble_sort(s: string) {
    let i, j, tmp, a = new Array();
    for (i = 0; i < s.length; i++) {
      a[i] = s[i];
    }
    s = "";
    for (i = 0; i < a.length; i++) {
      for (j = 0; j < a.length - 1 - i; j++) {
        if (a[j] > a[j + 1]) {
          tmp = a[j];
          a[j] = a[j + 1];
          a[j + 1] = tmp;
        }
      }
    }
    for (i = 0; i < a.length; i++) {
      s += a[i];
    }
    return s;
  }

  setType2(i: number) {
    var tmp = this.exam.set;
    if (tmp.indexOf(String.fromCharCode(i + 65)) < 0) {
      tmp += String.fromCharCode(i + 65);
    }
    else {
      tmp = tmp.replace(String.fromCharCode(i + 65), "");
    }
    tmp = this.bubble_sort(tmp);
    this.exam.set = tmp;
    if (this.exam.done > 0) {
      this.check();
    }
    this.saveSingleQuestionRecordByAppTokenAndExerciseId(this.exam);
    this.saveQuestionRecord();
  }

  //判断题
  getType3(i: number) {
    //var tmp=(i==0)?'正确':'错误';
    var tmp = this.getContent1()[i];
    if (tmp != this.exam.set) return '';
    else {
      if (this.exam.done == 0) return 'exam-botton-choose';
      else {
        if (this.exam.set == this.exam.answer) return 'exam-botton-right';
        else return 'exam-botton-wrong';
      }
    }
  }

  setType3(i: number) {
    //this.exam.set=(i==0)?'正确':'错误';
    this.exam.set = this.getContent1()[i];
    if (this.exam.done > 0) {
      this.check();
    }
    this.saveSingleQuestionRecordByAppTokenAndExerciseId(this.exam);
    this.saveQuestionRecord();
  }

  //分录题1
  getType4(n: number) {
    if (this.exam.set == "") {
      return "";
    }
    else {
      return this.exam.set.split("<br/><br/>")[n];
    }
  }

  setType4(event: any, n: number) {
    var tmp = "";
    var a = this.getContentLength;
    for (var i = 0; i < a - 1; i++) {
      if (i == n) {
        tmp += event.target.value + "<br/><br/>";
      }
      else {
        tmp += "<br/><br/>";
      }
    }
    if (n == a - 1) {
      tmp += event.target.value;
    }
    else {
      tmp += "";
    }
    if (this.exam.set == "") {
      this.exam.set = tmp;
    }
    else {
      tmp = "";
      var tp = this.exam.set.split("<br/><br/>");
      tp[n] = event.target.value;
      for (var i = 0; i < a - 1; i++) {
        tmp += tp[i] + "<br/><br/>";
      }
      tmp += tp[a - 1];
      this.exam.set = tmp;
    }
    //当其是已做且可判断的时候，进行自动判断
    if (this.exam.done > 0 && this.exam.typeShow != 5 && this.exam.typeShow != 8) {
      this.check();
    }
    this.saveSingleQuestionRecordByAppTokenAndExerciseId(this.exam);
    this.saveQuestionRecord();
  }

  //分录题2

  //不定项
  getType6(n: number, m: number) {
    if (m > 0) {
      m--;
      var tmp = this.exam.set;
      var tp = this.exam.answer.split('<br/><br/>')[n];
      if (tmp == "") return "";
      else {
        tmp = tmp.split("<br/><br/>")[n];
        if (tmp.indexOf(String.fromCharCode(m + 65)) < 0) {
          return '';
        }
        else {
          if (this.exam.done == 0) {
            return 'exam-botton-choose';
          }
          else {
            if (tmp == tp) {
              return 'exam-botton-right';
            }
            else {
              return 'exam-botton-wrong';
            }
          }
        }
      }
    }
  }

  setType6(n: number, m: number) {
    if (m > 0) {
      m--;
      var tmp = "";
      var a = this.getContentLength;
      for (var i = 0; i < a - 1; i++) {
        if (i == n) {
          tmp += String.fromCharCode(m + 65) + "<br/><br/>";
        }
        else {
          tmp += "<br/><br/>";
        }
      }

      if (n == a - 1) {
        tmp += String.fromCharCode(m + 65);
      }
      else {
        tmp += "";
      }

      if (this.exam.set == "") {
        this.exam.set = tmp;
      }
      else {
        tmp = "";
        var tp = this.exam.set.split("<br/><br/>");

        if (tp[n].indexOf(String.fromCharCode(m + 65)) < 0) {
          tp[n] += String.fromCharCode(m + 65);
        }
        else {
          tp[n] = tp[n].replace(String.fromCharCode(m + 65), "");
        }

        tp[n] = this.bubble_sort(tp[n]);
        for (var i = 0; i < a - 1; i++) {
          tmp += tp[i] + "<br/><br/>";
        }
        tmp += tp[a - 1];
        this.exam.set = tmp;
      }

      if (this.exam.done > 0) {
        this.check();
      }
      this.saveSingleQuestionRecordByAppTokenAndExerciseId(this.exam);
      this.saveQuestionRecord();
    }
  }

  //不定项9
  setType9(n: number, m: number) {
    if (m > 0) {
      m--;
      var tmp = "";
      var a = this.getContentLength;
      for (var i = 0; i < a - 1; i++) {
        if (i == n) {
          tmp += String.fromCharCode(m + 65) + "<br/><br/>";
        }
        else {
          tmp += "<br/><br/>";
        }
      }
      if (n == a - 1) {
        tmp += String.fromCharCode(m + 65);
      }
      else {
        tmp += "";
      }

      if (this.exam.set == "") {
        this.exam.set = tmp;
      }
      else {
        tmp = "";
        var tp = this.exam.set.split("<br/><br/>");
        if (tp[n].indexOf(String.fromCharCode(m + 65)) < 0) {
          tp[n] = String.fromCharCode(m + 65);
        }
        for (var i = 0; i < a - 1; i++) {
          tmp += tp[i] + "<br/><br/>";
        }
        tmp += tp[a - 1];
        this.exam.set = tmp;
      }
      if (this.exam.done > 0) {
        this.check();
      }
      this.saveSingleQuestionRecordByAppTokenAndExerciseId(this.exam);
      this.saveQuestionRecord();
    }

  }

  //手动判断题目分数
  handc() {
    let prompt = this.alertCtrl.create({
      title: '手动判断',
      subTitle: "系统无法自动判断此类题型的答案，请根据参考答案估值",
      inputs: [
        {
          type: 'radio',
          label: '100 (完全正确)',
          value: '1',
          checked: true
        },
        {
          type: 'radio',
          label: '80',
          value: '0.8'
        },
        {
          type: 'radio',
          label: '60',
          value: '0.6'
        },
        {
          type: 'radio',
          label: '40 ',
          value: '0.4'
        },
        {
          type: 'radio',
          label: '20',
          value: '0.2'
        },
        {
          type: 'radio',
          label: '0 (完全错误)',
          value: '2'
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
          }
        },
        {
          text: '确认',
          handler: data => {
            this.exam.done = parseFloat(data);
            console.log(data);
          }
        }
      ]
    });
    prompt.present();
  }

  sendError() {
    let modal = this.modalCtrl.create(ErrorPage, {token: this.token, id: this.exam.id});
    modal.present();
  }

  getNote() {
    this.navCtrl.push(NotePage, {id: this.exam.id, type: 7});
  }

  check() {
    if (this.exam.set == "") {
      this.exam.done = 0;
    }
    else {
      if (this.exam.typeShow == 5 || this.exam.typeShow == 8) {
        if (this.exam.done == 0) {
          this.exam.done = 3;
        }
      }
      else {
        if (this.exam.set == this.exam.answer) {
          this.exam.done = 1;
        }
        else {
          if (this.exam.typeShow == 4 || this.exam.typeShow == 6 || this.exam.typeShow == 7 || this.exam.typeShow == 9) {
            let as1 = this.exam.answer.split("<br/><br/>");
            let as2 = this.exam.set.split("<br/><br/>");
            let count = 0;
            for (let i = 0; i < as1.length; i++) {
              if (as1[i] == as2[i]) count++;
            }
            if (count == 0) {
              this.exam.done = 2;
            }
            else {
              this.exam.done = count / as1.length;
            }
          }
          else {
            this.exam.done = 2;
          }
        }
      }
    }
  }

  checkAll() {
    this.navCtrl.push(ScorePage, {
      subject: this.subject,
      title: this.title,
      exams: this.exams,
      mode: this.time,
      check: this.check,
      moduleType: this.moduleType,
      saveQuestionRecord: this.saveQuestionRecord
    }).then(() => {
      this.viewCtrl.dismiss()
    });
  }

  prev() {
    this.ans = true;
    if (this.id > 0) {
      this.id--;
      this.exam = this.exams[this.id];
    }
    $(".scroll-content").scrollTop(0)
  }

  next() {
    this.ans = true;
    if (this.id < this.all - 1) {
      this.id++;
      this.exam = this.exams[this.id];
    }
    $(".scroll-content").scrollTop(0)
  }

  swipe(event: any) {
    if (event.direction == 2) {
      this.next();
    }
    else if (event.direction == 4) {
      this.prev();
    }
  }

  getDtk() {
    this.setDtk = (params) => {
      return new Promise((resolve, reject) => {
        this.id = params;
        this.exam = this.exams[this.id];
        resolve();
      })
    };
    let modal = this.modalCtrl.create(DtkPage, {exams: this.exams, setDtk: this.setDtk});
    modal.present();
  }

  get: any;

  /*收藏题目的方法*/
  setGet() {
    if (this.get) {
      this.get = false;
      this.exam.get = 0;
    }
    else {
      this.get = true;
      this.exam.get = 1;
    }
    this.saveColletStateByAppTokenAndExerciseId(this.exam);//提交关注记录
  }


  goBack() {
    this.navCtrl.pop();
  }

  ionViewWillLeave() {
    clearInterval(this.jsq);
  }

  ionViewDidLeave() {
    clearInterval(this.jsq);
  }

  /**
   * 做题时 做题记录上传服务器 做题记录保存
   */
  saveSingleQuestionRecordByAppTokenAndExerciseId(exercise) {
    let this_ = this;
    if (this.moduleType !== null && (this.moduleType === 1 || this.moduleType === 2 || this.moduleType === 4 || this.moduleType === 7)) { //目前只记录 1、章节练习 2、核心考点的做题 4。考前押题 7.历年真题
      this_.httpstorage.getStorage('user', (data) => {
        if (data == null) {//无登录信息 返回登录页面
          this_.navCtrl.setRoot(LoginPage);
          return;
        } else if (data.token === '') {//游客不保存提交
          return;
        } else if (data.token !== null && data.token !== '' && data.token.length > 0) {//登录的注册 可提交做题数据
          this_.httpstorage.postHttp("/app/exerciseRecordController.do?doSaveSingleQuestionRecordByAppTokenAndExerciseId", JSON.stringify({
            token: data.token,
            subCourseId: this_.subject.id,
            moduleType: this_.moduleType,
            exerciseId: exercise.id,
            answer: exercise.set,
            isCollect: exercise.get,
            checkState: exercise.done,
            point: exercise.sb
          }), (data) => {
            //登录判断
            if (data != null) {
              if (data.returnCode === 3) {
                //重新登录
                this_.navCtrl.setRoot(LoginPage);
                this_.showMsg("已在其他设备登录，请重新登录！");
              }
            }
          });
        } else {
          //do nothing!
          return;
        }
      });
    }
  }

  /**
   * 题目收藏
   */
  saveColletStateByAppTokenAndExerciseId(exercise) {
    let this_ = this;
    this_.httpstorage.getStorage('user', (data) => {
      if (data == null) {//无登录信息 返回登录页面
        this_.navCtrl.setRoot(LoginPage);
        return;
      } else if (data.token === '') {//游客不保存提交
        return;
      } else if (data.token !== null && data.token !== '' && data.token.length > 0) {//登录的注册 可提交做题数据
        this_.httpstorage.postHttp("/app/exerciseRecordController.do?doSaveCollectQuestionRecordByAppTokenAndExerciseId", JSON.stringify({
          token: data.token,
          subCourseId: this_.subject.id,
          moduleType: this_.moduleType,
          exerciseId: exercise.id,
          isCollect: exercise.get
        }), (data) => {
          //登录判断
          if (data != null) {
            if (data.returnCode === 3) {
              //重新登录
              this_.navCtrl.setRoot(LoginPage);
              this_.showMsg("已在其他设备登录，请重新登录！");
            }
          }
        });
      } else {
        //do nothing!
        return;
      }
    });

  }

  showMsg(msg) {
    let alert = this.alertCtrl.create({
      title: '系统通知',
      subTitle: msg,
      buttons: ['好']
    });
    alert.present();
  }


}
