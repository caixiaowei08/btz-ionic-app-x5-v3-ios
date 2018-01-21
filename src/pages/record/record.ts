import { Component } from '@angular/core';
import { ViewController, NavController, NavParams} from 'ionic-angular';
import { HttpStorage } from '../../providers/httpstorage';
import { ExamPage } from '../exam/exam';
import { NullPage } from '../null/null';
@Component({
  selector: 'page-record',
  templateUrl: 'record.html'
})
export class RecordPage {
  title:any;
  subject:{id:number,name:string}
  exams:any;
  exam:any;
  nullpage:any;
  record:any;
  constructor(public viewCtrl: ViewController,public httpstorage: HttpStorage, public navCtrl: NavController,public navParams: NavParams) {
    this.nullpage=NullPage;
    this.title=this.navParams.get("title");
    this.subject=this.navParams.get("subject");
    this.exams=this.navParams.get("exams");
    this.record=[];
    this.httpstorage.getStorage("s"+this.subject.id+"r",(data)=>{
      this.record=data.sort((a,b)=>{
        return b.date-a.date;
      });
    })
    this.exam=[];
  }
  dismiss(){
    this.viewCtrl.dismiss();
  }
  getDate(i){
    let date=new Date(this.record[i].date);
    let h=date.getHours();
    let hh=h<10?"0"+h:h;
    let m=date.getMinutes();
    let mm=m<10?"0"+m:m;
    let s=date.getSeconds();
    let ss=s<10?"0"+s:s;
    return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+"  "+hh+":"+mm+":"+ss;
  }
  choose(i){
    for(let w of this.record[i].list){
      for(let v of this.exams){
        if(v.id==w.id){
          v.sb=w.sb;
          v.done=0;
          v.set="";
          this.exam.push(v);
          break;
        }
      }
    }
    this.navCtrl.push(ExamPage,{subject:this.subject,title:this.title,exams:this.exam,mode:false,time:this.record[i].time}).then(()=>{this.dismiss()});
  }
}
