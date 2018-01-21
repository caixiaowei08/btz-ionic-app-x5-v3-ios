import { Component } from '@angular/core';
import { ExamPage } from '../exam/exam';
import { ListPage } from '../list/list';
import { AlertController,NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-score',
  templateUrl: 'score.html'
})
export class ScorePage {
  exams:any;
  res:Array<{type:number,typeName:string,right:number,wrong:number,value:number}>
  score:any;
  //callback:any;
  check:any;
  exam:any;
  right:any;
  all:any;
  mode:any;
  subject:any;
  title:any;
  hand:any;
  constructor(public alertCtrl: AlertController,private navCtrl: NavController,public navParams: NavParams) {
    this.exams=this.navParams.get("exams");
    this.mode=this.navParams.get("mode");
    //this.callback=this.navParams.get("callback");
    this.check=this.navParams.get("check");
    this.subject=this.navParams.get("subject");
    this.title=this.navParams.get("title");
    this.score=0;
    /*
    this.callback=(params)=>{
      return new Promise((resolve, reject)=>{
        this.getScore();
        resolve();
      })
    }
    this.getScore();
    */
  }
  /*
  ionViewWillUnload(){
    this.navCtrl.pop();
  }
  */
  ionViewWillEnter(){
    this.hand=false;
    this.getScore();
  }
  getScore(){
    this.res=[];
    this.score=0;
    for(let v of this.exams){
      this.exam=v;
      this.check();
      if(this.exam.done==3) this.hand=true;
      let flg=true;
      for(let w of this.res){
        if(this.exam.type==w.type) {
          if(this.exam.done>0&&this.exam.done<=1){
            w.right+=this.exam.done;
            w.wrong+=1-this.exam.done;
            w.value+=this.exam.sb;
          }
          else if(this.exam.done==2) {w.wrong++;w.value+=this.exam.sb;}
          flg=false;
          break;
        }
      }
      if(flg){
        if(this.exam.done>0&&this.exam.done<=1) this.res.push({type:v.type,typeName:v.typeName,right:this.exam.done,wrong:1-this.exam.done,value:v.sb});
        else if(this.exam.done==2) this.res.push({type:v.type,typeName:v.typeName,right:0,wrong:1,value:v.sb});
        else this.res.push({type:v.type,typeName:v.typeName,right:0,wrong:0,value:v.sb});
        /*
        if(this.exam.done>0&&this.exam.done<=1) this.res.push({type:v.type,typeName:v.typeName,right:this.exam.done,wrong:0,value:v.sb});
        else if(this.exam.done==2) this.res.push({type:v.type,typeName:v.typeName,right:0,wrong:1,value:v.sb});
        else this.res.push({type:v.type,typeName:v.typeName,right:0,wrong:0,value:v.sb});
        */
      }
    }
    this.right=0;
    this.all=0;
    let alls=0;
    for(let v of this.res){
      this.right+=v.right;
      this.all+=v.right+v.wrong;
      alls+=v.right+v.wrong==0?0:v.right*v.value/(v.right+v.wrong);
    }
    if(this.mode==0) this.score=this.right==0?0:this.getSum(100*this.right/this.all);
    else this.score=this.getSum(alls);

    if(this.hand){
      let prompt = this.alertCtrl.create({
        title: '系统通知',
        subTitle:'检测到您的试题中存在主观的题目，为了更准确的计算得分，将为您挑选出这些题让您手动判断',
        buttons: [
          {
            text:'偏偏不要'
          },
          {
            text: '好的',
            handler: data => {
              this.getHand()
            }
          }
        ]
      })
      prompt.present();
    }
  }
  getSum(v){
    console.log(v);
    if(v-parseInt(v)>0) return v.toFixed(1);
    else return v.toFixed(0);
  }
  getHand(){
    let newexams=new Array();
    for(let val of this.exams){
      if(val.done==3) newexams.push(val);
    }
    this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:newexams,mode:2,time:0});
  }
  getAll(){
    //this.callback(this.exams).then(this.navCtrl.pop());
    //this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:this.exams,mode:true,time:0,callback:this.callback});
    this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:this.exams,mode:2,time:0});
  }
  getWrong(){
    let newexams=new Array();
    for(let val of this.exams){
      if(val.done==2||(val.done>0&&val.done<1)) newexams.push(val);
    }
    //this.callback(newexams).then(this.navCtrl.pop());
    //this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:newexams,mode:true,time:0,callback:this.callback});
    this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:newexams,mode:2,time:0});
  }
}
