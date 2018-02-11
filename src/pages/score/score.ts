import {Component} from '@angular/core';
import {ExamPage} from '../exam/exam';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {HttpStorage} from '../../providers/httpstorage';
import {LoginPage} from '../../pages/login/login';

@Component({
  selector: 'page-score',
  templateUrl: 'score.html'
})
export class ScorePage {
  exams: any;
  res: Array<{ type: number, typeName: string, right: number, wrong: number, value: number }>
  score: any;
  check: any;
  exam: any;
  right: any;
  moduleType: any;
  all: any;
  mode: any;
  subject: any;
  title: any;
  hand: any;
  saveQuestionRecord: any;
  comeFrom: any;

  constructor(public alertCtrl: AlertController, private navCtrl: NavController, public navParams: NavParams, public httpStorage: HttpStorage) {
    this.exams = this.navParams.get("exams");
    this.mode = this.navParams.get("mode");
    this.check = this.navParams.get("check");
    this.subject = this.navParams.get("subject");
    this.title = this.navParams.get("title");
    this.comeFrom = this.navParams.get("comeFrom");
    this.moduleType = this.navParams.get("moduleType");
    this.saveQuestionRecord = this.navParams.get("saveQuestionRecord");
    this.score = 0;
  }

  ionViewWillEnter() {
    this.hand = false;
    this.getScore();
  }

  getScore() {
    this.res = [];
    this.score = 0;
    for (let v of this.exams) {
      this.exam = v;
      this.check();

      if (this.exam.done == 3) {
        this.hand = true;
      }

      let flg = true;
      for (let w of this.res) {
        if (this.exam.type == w.type) {
          if (this.exam.done > 0 && this.exam.done <= 1) {
            w.right += this.exam.done;
            w.wrong += 1 - this.exam.done;
            w.value += this.exam.sb;
          }
          else if (this.exam.done == 2) {
            w.wrong++;
            w.value += this.exam.sb;
          }
          flg = false;
          break;
        }
      }

      if (flg) {
        if (this.exam.done > 0 && this.exam.done <= 1) {
          this.res.push({
            type: v.type,
            typeName: v.typeName,
            right: this.exam.done,
            wrong: 1 - this.exam.done,
            value: v.sb
          });
        }
        else if (this.exam.done == 2) {
          this.res.push({
            type: v.type,
            typeName: v.typeName,
            right: 0,
            wrong: 1,
            value: v.sb
          });
        }
        else {
          this.res.push({type: v.type, typeName: v.typeName, right: 0, wrong: 0, value: v.sb});
        }
      }
    }
    this.right = 0;
    this.all = 0;
    let alls = 0;
    for (let v of this.res) {
      this.right += v.right;
      this.all += v.right + v.wrong;
      alls += v.right + v.wrong == 0 ? 0 : v.right * v.value / (v.right + v.wrong);
    }
    if (this.mode == 0) {
      this.score = this.right == 0 ? 0 : this.getSum(100 * this.right / this.all);
    }
    else {
      this.score = this.getSum(alls);
    }

    if (this.hand) {
      let prompt = this.alertCtrl.create({
        title: '系统通知',
        subTitle: '检测到您的试题中存在主观的题目，为了更准确的计算得分，将为您挑选出这些题让您手动判断',
        buttons: [
          {
            text: '偏偏不要'
          },
          {
            text: '好的',
            handler: data => {
              this.getHand()
            }
          }
        ]
      });
      prompt.present();
    }

    this.saveQuestionRecord();
    this.sendAllRecordToServce();
  }


  getSum(v) {
    if (v - parseInt(v) > 0) {
      return v.toFixed(1);
    }
    else {
      return v.toFixed(0);
    }
  }

  getHand() {
    let newexams = new Array();
    for (let val of this.exams) {
      if (val.done == 3) {
        newexams.push(val);
      }
    }
    this.navCtrl.push(ExamPage, {subject: this.subject, title: this.title, exams: newexams, mode: 2, time: 0});
  }

  getAll() {
    this.navCtrl.push(ExamPage, {subject: this.subject, title: this.title, exams: this.exams, mode: 2, time: 0});
  }

  getWrong() {
    let newexams = new Array();
    for (let val of this.exams) {
      if (val.done == 2 || (val.done > 0 && val.done < 1)) {
        newexams.push(val);
      }
    }
    this.navCtrl.push(ExamPage, {subject: this.subject, title: this.title, exams: newexams, mode: 2, time: 0});
  }

  /**
   * 做题时 做题记录上传服务器 做题记录保存
   */
  saveSingleQuestionRecordByAppTokenAndExerciseId(exercise) {
    let this_ = this;
    this_.httpStorage.getStorage('user', (data) => {
      if (data == null) {//无登录信息 返回登录页面
        this_.navCtrl.setRoot(LoginPage);
        return;
      } else if (data.token === '') {//游客不保存提交
        return;
      } else if (data.token !== null && data.token !== '' && data.token.length > 0) {//登录的注册 可提交做题数据
        this_.httpStorage.postHttp("/app/exerciseRecordController.do?doSaveSingleQuestionRecordByAppTokenAndExerciseId", JSON.stringify({
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

  showMsg(msg) {
    let alert = this.alertCtrl.create({
      title: '系统通知',
      subTitle: msg,
      buttons: ['好']
    });
    alert.present();
  }

  //转换moduleType
  covertModuleTypeToType(moduleType) {
    switch (moduleType) {
      case 1:
        return 1;//章节练习
      case 2:
        return 2;//核型考点
      case 3:
        return 3;//模拟考题
      case 4:
        return 4;//考前押题
      case 7:
        return 5;//历年真题
      default:
        return 0;
    }
  }

  sendAllRecordToServce() {
    let this_ = this;

    if (this_.comeFrom !== undefined && (this_.comeFrom === 1 || this_.comeFrom === 2)) {
      return;
    }

    setTimeout(function () {
      if (this_.moduleType !== null && (this_.moduleType === 1 || this_.moduleType === 2 || this_.moduleType === 4 || this_.moduleType === 7)) {
        this_.httpStorage.getStorage("s" + this_.subject.id + "i" + this_.covertModuleTypeToType(this_.moduleType), (data) => {
          if (data != null) {
            for (let examItem of data.exam) {
              if ((examItem.set != null && examItem.set.length > 0) || (examItem.get > 0)) {
                this_.saveSingleQuestionRecordByAppTokenAndExerciseId(examItem);
              }
            }
          }
        });
      }
    }, 500);
  }

}
