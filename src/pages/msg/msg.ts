import { Component } from '@angular/core';
import { AlertController, NavController, NavParams} from 'ionic-angular';
import { HttpStorage } from '../../providers/httpstorage';
import { NullPage } from '../null/null';
import { ExamPage } from '../exam/exam';

@Component({
  selector: 'page-msg',
  templateUrl: 'msg.html'
})
export class MsgPage {
  id:any;
  token:any;
  msg:any;
  tt:any;
  constructor(public alertCtrl: AlertController,public navCtrl: NavController,public navParams: NavParams,public httpstorage: HttpStorage) {
    this.msg=null;
    this.httpstorage.getStorage("user",(data)=>{
      this.token=data.token;
      this.getMsg();
      this.setAll();
    });
  }
  setAll(){
    this.httpstorage.getHttp("/app/feedbackController.do?doUpdateLookStateByToken&token="+this.token,(data)=>{});    
  }
  getMsg(){
    this.httpstorage.getHttp("/app/feedbackController.do?doGetFeedBackInfo&token="+this.token,(data)=>{
      if(data!=null){
        if(data.returnCode){
          this.msg=data.content==null?[]:data.content;
        }
        else this.msg=[];
      }
      else this.msg=[];
    })
  }
  goExam(id){
    console.log(id);
    let exam=[];
    this.httpstorage.getHttp('/app/appExerciseController.do?doGetExerciseByExerciseId&id='+id,(data)=>{
      if(data!=null){
        if(data.returnCode) exam.push(data.content);
      }
      console.log(exam);
      this.navCtrl.push(ExamPage,{subject:'',title:"look",exams:exam,mode:false,time:0});
    })
  }
  ionViewDidEnter(){

  }
}
