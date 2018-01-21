import { Component } from '@angular/core';
import { ViewController, NavController, NavParams} from 'ionic-angular';
import { ExamPage } from '../exam/exam';
import { HttpStorage } from '../../providers/httpstorage';
@Component({
  selector: 'page-lists',
  templateUrl: 'lists.html'
})
export class ListsPage {
  subject:any;
  title:any;
  exams:any;
  beg:any;
  saveQuestionRecord:any;
  all:any;
  exam:any;
  remembermode:any;
  notdonemode:any;
  type:any;
  sum:any;
  types:any;
  sums:any;
  constructor(public httpstorage: HttpStorage,public viewCtrl: ViewController , public navCtrl: NavController, public navParams: NavParams) {
    this.subject= this.navParams.get('subject');
    this.title= this.navParams.get('title');
    this.exams= this.navParams.get('exams');
    this.beg= this.navParams.get('beg');
    this.saveQuestionRecord= this.navParams.get('saveQuestionRecord');
    this.all= this.navParams.get('all');
    this.exam=new Array();
    this.remembermode=false;
    this.notdonemode=false;
    this.types=['全部','','','',''];
    for(let i=this.beg;i<this.beg+this.all;i++){
      let tmp=this.exams[i];
      if(tmp.typeShow==1) this.types[1]='单选题';
      else if(tmp.typeShow==2) this.types[2]='多选题';
      else if(tmp.typeShow==3) this.types[3]='判断题';
      else this.types[4]='大题';
    }
    this.type=0;
    this.sums=new Array();
    for(let i=0;i<=this.all/5;i++){
      if(i==0) this.sums[i]=this.all;
      else this.sums[i]=i*5;
      if(i>=9) break;
    }
    this.sum=this.all;
  }
  dismiss(){
    this.viewCtrl.dismiss();
  }
  choose(){
    var cot=0;
    for(let i=this.beg;i<this.beg+this.all;i++){
      var f1,f2;
      if(this.notdonemode){
        if(this.exams[i].done==0) f1=true;
        else f1=false;
      }
      else f1=true;
      if(this.type==0) f2=true;
      else if(this.type<4){
        if(this.type==this.exams[i].typeShow) f2=true;
        else f2=false;
      }
      else{
        if(this.exams[i].typeShow>=4) f2=true;
        else f2=false;
      }
      if(f1&&f2&&cot<this.sum) this.exam[cot++]=this.exams[i];
    }
    //this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:this.exam,beg:0,all:cot}).then(()=>{this.dismiss()});
    this.navCtrl.push(ExamPage,{subject:this.subject,saveQuestionRecord:this.saveQuestionRecord,title:this.title,exams:this.exam,mode:this.remembermode,time:0}).then(()=>{this.dismiss()});
    /*
    this.httpstorage.getStorage("s"+this.subject.id+"s",(data)=>{
      if(data!=null){
        for(let v of this.exam){
          for(let w of data.questions){
            if(v.type==w.examType){
              v.sb=w.point;
              break;
            }
          }
        }
        this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:this.exam,mode:this.remembermode,time:0}).then(()=>{this.dismiss()});
      }
      else{
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
    });
    */
  }
}
