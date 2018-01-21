import { Component } from '@angular/core';
import { ViewController, NavController, NavParams} from 'ionic-angular';
import { ExamPage } from '../exam/exam';
@Component({
  selector: 'page-dtk',
  templateUrl: 'dtk.html'
})
export class DtkPage {
  exams:any;
  setDtk:any;
  type:any;
  constructor(public viewCtrl: ViewController , public navCtrl: NavController, public navParams: NavParams) {
    this.exams= this.navParams.get('exams');
    this.setDtk=this.navParams.get("setDtk");
    /*
    this.type=[
      {tit:'一、单项选择题',sum:new Array()},
      {tit:'二、多项选择题',sum:new Array()},
      {tit:'三、判断题',sum:new Array()},
      {tit:'四、大题',sum:new Array()}
    ]
    */
    this.type=new Array();
    //['全部','单选题','多选题','判断题','案例题'];
    for(let i=0;i<this.exams.length;i++){
      let flg=false;
      let tmp;
      for(let v of this.type){
        if(this.exams[i].type==v.type){
          tmp=v;
          flg=true;
          break;
        }
      }
      if(flg) tmp.sum.push(i);
      else{
        this.type.push({type:this.exams[i].type,tit:this.exams[i].typeName,sum:[i]});
      }
      /*
      if(this.exams[i].typeShow<4) this.type[this.exams[i].typeShow-1].sum.push(i);
      else this.type[3].sum.push(i);
      */
    }
  }
  getStyle(id){
    if(this.exams[id].done==0){
      if(this.exams[id].set=="") return '';
      else return 'exam-botton-choose';
    }
    else if(this.exams[id].done==1) return 'exam-botton-right';
    else if(this.exams[id].done<1||this.exams[id].done==2) return 'exam-botton-wrong';
    else return 'exam-botton-choose';
  }
  dismiss(){
    this.viewCtrl.dismiss();
  }
  choose(id){
    //let id=this.getSum(i,j)
    this.setDtk(id).then(()=>{this.dismiss()});
  }
}
