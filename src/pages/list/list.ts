import {Component} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController, NavParams} from 'ionic-angular';
import {ListsPage} from '../lists/lists';
import {ExamPage} from '../exam/exam';
import {HttpStorage} from '../../providers/httpstorage';
import {Storage} from "@ionic/storage";
import {LoginPage} from '../../pages/login/login';
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
  moduleType: any;

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public modalCtrl: ModalController, public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public httpstorage: HttpStorage) {
    this.subject = this.navParams.get('subject');
    this.title = this.navParams.get('title');
    this.test = null;
    this.type = this.navParams.get('type') + 1;
    this.loader = this.loadingCtrl.create({
      content: "请耐心等待10秒钟哦...",
      showBackdrop: false
    });
    this.loader.present();
    this.covertToServiceModuleType(this.type);
    this.getSubsItem(this.subject, this.type);
  }


  //转换moduleType
  covertToServiceModuleType(type) {
    switch (type) {
      case 1:
        this.moduleType = 1;//章节练习
        break;
      case 2:
        this.moduleType = 2;//核型考点
        break;
      case 3:
        this.moduleType = 3;//模拟考题
        break;
      case 4:
        this.moduleType = 4;//考前押题
        break;
      case 5:
        this.moduleType = 7;//历年真题
        break;
      default:
        this.moduleType = 0;
        break;
    }
  }

  getSubsItem(subject: any, type: any) {
    let this_ = this;
    let subjectId = subject.id;
    if (subjectId > 0) {//判断课程ID的有效性
      //有效
      this.httpstorage.getStorage('user', (user) => {
        if (user == null) {//无登录信息
          this_.loader.dismiss();
          this_.navCtrl.setRoot(LoginPage);
          return;
        } else if (user.token === "") {//游客登录
          //本地获取 获取不到 网络获取 done
          this_.getExamInfoBySubjectIdAndModuleTypeAndToken(subjectId, this_.moduleType, "", type);
        } else if (user.token !== null && user.token !== '' && user.token.length > 0) {
          this_.getExamInfoBySubjectIdAndModuleTypeAndToken(subjectId, this_.moduleType, user.token, type);
        } else {
          // do nothing! 这种情况不存在 以防万一 给个提示！
          this_.loader.dismiss();
          this_.showMsg("登录用户异常list down load！");
          return;
        }
      });
    } else {
      //课程ID无效
      // do nothing! 这种情况不存在 以防万一 给个提示！
      this_.showMsg("课程信息异常 subjectId：" + subjectId);
    }

  }

  //登录账号获取题目信息
  getExamInfoBySubjectIdAndModuleTypeAndToken(subjectId, moduleType, token, type) {
    let this_ = this;
    let localExamVersionData = null;//本地版本信息
    let localExamInfoData = null;
    //首先获取版本 再获取题目信息
    this_.httpstorage.getStorage("s" + subjectId + "i" + type + "v", (versionData) => {
      localExamVersionData = versionData;
      this_.httpstorage.getStorage("s" + subjectId + "i" + type, (examData) => {
        localExamInfoData = examData;
        this_.test = localExamInfoData;
        //开始判断 若无本地版本信息或者题目信息 则直接从网络获取
        if (localExamVersionData === null) {
          if (localExamInfoData === null) {
            //无版本信息 无题目数据 =》直接下载题目数据
            this_.downloadExamDataBySubjectIdAndModuleTypeAndToken(subjectId, moduleType, token, type);
          } else {
            //无版本信息 有题目数据 =》直接获取题目 并将本地合并 新版本上
            this_.downloadExamDataBySubjectIdAndModuleTypeAndTokenWithMerge(subjectId, moduleType, token, type, localExamInfoData);
          }
        } else {
          if (localExamInfoData === null) {
            //有版本信息 无题目数据 =》直接下载题目数据
            this_.downloadExamDataBySubjectIdAndModuleTypeAndToken(subjectId, moduleType, token, type);
          } else {
            //有版本信息 有题目数据 =》判断版本信息 是否需要更新
            this_.httpstorage.getHttp('/app/appModuleController.do?getModuleBySubCourseIdAndModuleType&subCourseId=' + subjectId + '&moduleType=' + moduleType, (remoteExamVersionData) => {
              if (remoteExamVersionData === null) { //无网络
                //do nothing 沿用本地版本不变
                this_.loader.dismiss();
              } else { //
                if (remoteExamVersionData.returnCode === 1) {
                  if (localExamVersionData === remoteExamVersionData.content.versionNo) {
                    //尝试下载做题记录 进行合并
                    this_.downloadExamRecordBySubjectIdAndModuleTypeAndTokenWithMerge(subjectId, moduleType, token, type, localExamInfoData);
                  } else {
                    this_.downloadExamDataBySubjectIdAndModuleTypeAndTokenWithMerge(subjectId, moduleType, token, type, localExamInfoData);
                  }
                } else {
                  //尝试下载做题记录并合并 沿用本地版本
                  this_.downloadExamRecordBySubjectIdAndModuleTypeAndTokenWithMerge(subjectId, moduleType, token, type, localExamInfoData);
                }
              }
            });
          }
        }
      });

    });
  }

  //直接下载题目 无需合并本地题目
  downloadExamDataBySubjectIdAndModuleTypeAndToken(subjectId, moduleType, token, type) {
    let this_ = this;
    this_.httpstorage.postHttp('/app/appExerciseController.do?getModuleExerciseByCourseIdAndModuleTypeAndTokenWithRecord&subCourseId=' + subjectId + '&moduleType=' + moduleType + "&token=" + token, JSON.stringify({}), (data) => {
      //更新本地数据，并加载
      if (data === null) {
        this_.loader.dismiss();
        this_.showMsg("网络异常！");
        return;
      }

      if (data.returnCode === 1) {
        this_.test = data.content;//用于显示
        this_.httpstorage.setStorage("s" + subjectId + "i" + type, data.content);//保存题目
        this_.httpstorage.setStorage("s" + subjectId + "i" + type + "v", data.content.version);//记录版本号
        this_.loader.dismiss();
      } else if (data.returnCode === 3) {
        this_.loader.dismiss();
        this_.showMsg(data.msg);
        this_.navCtrl.setRoot(LoginPage);
      } else {
        this_.loader.dismiss();
        this_.showMsg("下载题目异常!");
      }
    });

  }

  //下载题目并何合并本地版本
  downloadExamDataBySubjectIdAndModuleTypeAndTokenWithMerge(subjectId, moduleType, token, type, localExamInfoData) {
    let this_ = this;
    this_.httpstorage.postHttp('/app/appExerciseController.do?getModuleExerciseByCourseIdAndModuleTypeAndTokenWithRecord&subCourseId=' + subjectId + '&moduleType=' + moduleType + "&token=" + token, JSON.stringify({}), (data) => {
      //更新本地数据，并加载
      if (data === null) {
        this_.loader.dismiss();
        return;
      }

      if (data.returnCode === 1) {
        for (let remoteExerciseRecordItem of data.content.exam) {
          for (let localExerciseItem of localExamInfoData.exam) {
            if (remoteExerciseRecordItem.exerciseId === localExerciseItem.id) {
              if (remoteExerciseRecordItem.id === localExerciseItem.id) {
                //若本地存在记录本地覆盖服务端
                if (localExerciseItem.done > 0) {
                  remoteExerciseRecordItem.done = localExerciseItem.done;
                }

                if (localExerciseItem.get > 0) {
                  remoteExerciseRecordItem.get = localExerciseItem.get;
                }

                if (localExerciseItem.set !== null && localExerciseItem.set.length > 0) {
                  remoteExerciseRecordItem.set = localExerciseItem.set;
                }
                break;
              }
            }
          }
        }
        this_.test = data.content;
        this_.httpstorage.setStorage("s" + subjectId + "i" + type, data.content);
        this_.httpstorage.setStorage("s" + subjectId + "i" + type + "v", data.content.version);//记录版本号
        this_.loader.dismiss();
      } else if (data.returnCode === 3) {
        this_.loader.dismiss();
        this_.showMsg(data.msg);
        this_.navCtrl.setRoot(LoginPage);
      } else {
        this_.loader.dismiss();
        //this_.showMsg(data.msg);
        //do nothing
      }
    });
  }

  //下载记录并且合并到本地记录上
  downloadExamRecordBySubjectIdAndModuleTypeAndTokenWithMerge(subjectId, moduleType, token, type, localExamInfoData) {
    let this_ = this;

    if (token === "") {//游客无需获取做题记录
      this_.loader.dismiss();
      return;
    }

    this_.httpstorage.postHttp("/app/exerciseRecordController.do?doGetQuestionRecordListByAppTokenAndSubCourseIdAndModuleType", JSON.stringify({
        token: token,
        subCourseId: subjectId,
        moduleType: moduleType,
      }), (exerciseRecordData) => {
        if (exerciseRecordData === null) {
          this_.loader.dismiss();
          //无网络 do nothing
        } else {
          if (exerciseRecordData.returnCode === 1) {
            for (let remoteExerciseRecordItem of exerciseRecordData.content) {
              for (let localExerciseItem of localExamInfoData.exam) {
                if (remoteExerciseRecordItem.exerciseId === localExerciseItem.id) {
                  //若本地没有记录则覆盖
                  if (!(localExerciseItem.done > 0)) {
                    localExerciseItem.done = remoteExerciseRecordItem.checkState;
                  }

                  if (localExerciseItem.get < 1) {
                    localExerciseItem.get = remoteExerciseRecordItem.isCollect;
                  }

                  if (localExerciseItem.set === null || localExerciseItem.set.length === 0) {
                    localExerciseItem.set = remoteExerciseRecordItem.answer;
                  }
                  break;
                }
              }
            }
            this_.test = localExamInfoData;
            this_.httpstorage.setStorage("s" + subjectId + "i" + type, localExamInfoData);
            this_.loader.dismiss();
          }
          else if (exerciseRecordData.returnCode === 3) {
            this_.loader.dismiss();
            this_.showMsg(exerciseRecordData.msg);
            this_.navCtrl.setRoot(LoginPage);
          } else {
            this_.loader.dismiss();
            //this_.showMsg(exerciseRecordData.msg);
            //do nothing
          }
        }
      }
    );
  }


  showMsg(msg) {
    let alert = this.alertCtrl.create({
      title: '系统通知',
      subTitle: msg,
      buttons: ['好']
    });
    alert.present();
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

  choose(beg: number, all: number, tit: string, tryOut: any) {
    if (tryOut || (this.subject.exam && this.subject.time >= new Date().getTime())) {
      if (this.type == 1 || this.type == 2) {
        let modal = this.modalCtrl.create(ListsPage, {
          subject: this.subject,
          saveQuestionRecord: this.saveQuestionRecord.bind(this),
          title: tit,
          exams: this.test.exam,
          moduleType: this.moduleType,
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
            saveQuestionRecord: this.saveQuestionRecord.bind(this),
            moduleType: this.moduleType,
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
            this.doClearAllQuestionRecordListByAppTokenAndSubCourseIdAndModuleType();
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
    // if (this.type == 1 || this.type == 2) {
    //this.httpstorage.setStorage("s" + this.subject.id + "i" + this.type, this.test);
    //}
  }

  saveQuestionRecord() {
    var this_ = this;
    if (this_.type == 1 || this_.type == 2 || this_.type == 4 || this_.type == 5) {
      this_.httpstorage.setStorage("s" + this_.subject.id + "i" + this_.type, this_.test);
    }
  }

  /**
   * 重置服务端的做题记录
   */
  doClearAllQuestionRecordListByAppTokenAndSubCourseIdAndModuleType() {
    let this_ = this;
    if (this.moduleType !== null && (this.moduleType === 1 || this.moduleType === 2 || this.moduleType === 4 || this.moduleType === 7)) { //目前只记录 1、章节练习 2、核心考点的做题 4。考前押题 7.历年真题
      this_.httpstorage.getStorage('user', (data) => {
        if (data == null) {//无登录信息 返回登录页面
          this_.navCtrl.setRoot(LoginPage);
          return;
        } else if (data.token === '') {//游客不保存提交
          return;
        } else if (data.token !== null && data.token !== '' && data.token.length > 0) {//登录的注册 可提交做题数据
          this_.httpstorage.postHttp("/app/exerciseRecordController.do?doClearAllQuestionRecordListByAppTokenAndSubCourseIdAndModuleType", JSON.stringify({
            token: data.token,
            subCourseId: this_.subject.id,
            moduleType: this_.moduleType,
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


}
