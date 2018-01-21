import { Component } from '@angular/core';
import { ViewController,ModalController, AlertController, NavController, NavParams} from 'ionic-angular';
import { NullPage } from '../null/null';
import { NotePage } from '../note/note';
import { ScorePage } from '../score/score';
import { DtkPage } from '../dtk/dtk';
import { ErrorPage } from '../error/error';
import { HttpStorage } from '../../providers/httpstorage';
import * as $ from "jquery";

@Component({
  selector: 'page-exam',
  templateUrl: 'exam.html'
})
export class ExamPage {
  subject:{id:number,name:string}
  title:any;
  exams:any;
  all:any;
  saveQuestionRecord:any;
  mode:any;
  time:any;
  timeM:any;
  exam:any;
  id:any;
  allarr:any;
  nullpage:any;
  //callback:any;
  setDtk:any;
  token:any;
  jsq:any;
  //sexam:any;
  constructor(public viewCtrl:ViewController,public modalCtrl: ModalController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams,public httpstorage:HttpStorage) {
    this.subject= this.navParams.get('subject');
    this.title= this.navParams.get('title');
    this.exams= this.navParams.get('exams');
    this.mode= this.navParams.get('mode');
    this.saveQuestionRecord= this.navParams.get('saveQuestionRecord');
    this.time=this.navParams.get("time");
    //题目排序
    //this.callback=this.navParams.get("callback");
    //if(this.callback==null) this.exams.sort((a,b)=>{return a.type-b.type});
    //this.sexam=this.exams;
    if(this.mode!=2&&this.time==0){
      this.exams.sort((a,b)=>{
        if(a.typeShow==b.typeShow) return a.type-b.type;
        else return a.typeShow-b.typeShow
      });
    }
    this.timeM="";
    if(this.time>0){
      let tmp=this.time*60;
      let checkAll=this.checkAll.bind(this);
      this.getTime(tmp);
      let getTime=this.getTime.bind(this);
      this.jsq=setInterval(function(){
        if(tmp>0){
          tmp--;
          getTime(tmp);
        }
        else checkAll();
        //console.log(tmp);
      },1000)
    }
    this.id=0;
    this.exam=this.exams[this.id];
    this.all=this.exams.length;
    this.allarr=new Array(this.all);
    this.nullpage=NullPage;
    this.ans=true;
    this.httpstorage.getStorage("user",(data)=>{
      this.token=data.token;
    });
    this.exam7=new Array();
    for(let i=0;i<50;i++){
      this.exam7[i]=new Array();
      for(let j=0;j<20;j++) this.exam7[i][j]="";
    }
  }
  getTime(t){
    let tmp=parseInt(t/60+"");
    let sec,se;
    if(tmp<10) sec="0"+tmp;
    else sec=tmp+"";
    tmp=t-tmp*60;
    if(tmp<10) se="0"+tmp;
    else se=tmp+"";
    this.timeM=sec+" : "+se;
  }
  ans:boolean;
  getType(){
    /*
    if(this.exam.done>0||this.mode) this.ans=false;
    else this.ans=true;
    */
    if(this.mode) this.ans=false;
    if(this.exam.get) this.get=true;
    else this.get=false;
    //console.log(this.exam.typeShow)
    if(this.exam.typeShow==7) this.getType7();
    return this.exam.typeName;
  }
  getContentLength:any;
  getContent1(){
    var tmp=this.exam.content.split("<br/>");
    this.getContentLength=tmp.length;
    return tmp;
  }
  getContent2(){
    var tmp=this.exam.content.split("<br/><br/>");
    this.getContentLength=tmp.length;
    return tmp;
  }
  getContent2Sub(s:any){
    return s.split("<br/>");
  }
  exam7:any;
  exam7ans:any;
  getContent3(){
    var tmp=this.exam.content.split("<br/><br/><br/>");
    this.getContentLength=tmp.length;
    return tmp;
  }
  getContent3Sub(s:any){
    let tmp=s.split("<br/><br/>");
    this.exam7ans=tmp[1].split("<br/>");
    return tmp[0].split("<br/>");
  }
  getType7ans(s){
    return s.split(".")[0];
  }
  getType7(){
    let tmp=this.exam.set.split("<br/>");
    for(let i=0;i<50;i++){
      if(i<tmp.length){
        for(let j=0;j<20;j++){
          if(j<tmp[i].length) this.exam7[i][j]=tmp[i][j];
          else this.exam7[i][j]="";
        }
      }
      else{
        for(let j=0;j<20;j++) this.exam7[i][j]="";
      }
    }
  }
  setType7(){
    let res="";
    for(let i=0;i<this.getContentLength;i++){
      let tmp=this.getContent3()[i].split("<br/><br/>")[0].split("<br/>");
      for(let j=0;j<tmp.length;j++) res+=this.exam7[i][j];
      if(i<this.getContentLength-1) res+="<br/><br/>";
    }
    this.exam.set=res;
    if(this.exam.done>0) this.check();
    this.saveQuestionRecord();
  }
  //单选题
  getType1(i:number){
    if(String.fromCharCode(i+65)!=this.exam.set) return '';
    else{
      if(this.exam.done==0) return 'exam-botton-choose';
      else{
        if(this.exam.set==this.exam.answer) return 'exam-botton-right';
        else return 'exam-botton-wrong';
      }
    }
  }
  setType1(i:number){
    this.exam.set=String.fromCharCode(i+65);
    if(this.exam.done>0) this.check();
    this.saveQuestionRecord();
  }
  //多选题
  getType2(i:number){
    if(this.exam.set.indexOf(String.fromCharCode(i+65))<0) return '';
    else{
      if(this.exam.done==0) return 'exam-botton-choose';
      else {
        if(this.exam.set==this.exam.answer) return 'exam-botton-right';
        else return 'exam-botton-wrong';
      }
    }
  }
  bubble_sort(s:string){
    var i,j,tmp,a=new Array();
    for(i=0;i<s.length;i++) a[i]=s[i];s="";
    for(i=0;i<a.length;i++){
      for(j=0;j<a.length-1-i;j++){
        if(a[j]>a[j+1]){
          tmp=a[j];
          a[j]=a[j+1];
          a[j+1]=tmp;
        }
      }
    }
    for(i=0;i<a.length;i++) s+=a[i];
    return s;
  }
  setType2(i:number){
    var tmp=this.exam.set;
    if(tmp.indexOf(String.fromCharCode(i+65))<0) tmp+=String.fromCharCode(i+65);
    else tmp=tmp.replace(String.fromCharCode(i+65),"");
    tmp=this.bubble_sort(tmp);
    this.exam.set=tmp;
    if(this.exam.done>0) this.check();
    this.saveQuestionRecord();
  }
  //判断题
  getType3(i:number){
    //var tmp=(i==0)?'正确':'错误';
    var tmp=this.getContent1()[i];
    if(tmp!=this.exam.set) return '';
    else{
      if(this.exam.done==0) return 'exam-botton-choose';
      else{
        if(this.exam.set==this.exam.answer) return 'exam-botton-right';
        else return 'exam-botton-wrong';
      }
    }
  }
  setType3(i:number){
    //this.exam.set=(i==0)?'正确':'错误';
    this.exam.set=this.getContent1()[i];
    if(this.exam.done>0) this.check();
    this.saveQuestionRecord();
  }
  //分录题1
  getType4(n:number){
    if(this.exam.set=="") return "";
    else return this.exam.set.split("<br/><br/>")[n];
  }
  setType4(event:any,n:number){
    var tmp="";
    var a=this.getContentLength;
    for(var i=0;i<a-1;i++){
      if(i==n) tmp+=event.target.value+"<br/><br/>";
      else tmp+="<br/><br/>";
    }
    if(n==a-1) tmp+=event.target.value;
    else tmp+="";
    if(this.exam.set=="") this.exam.set=tmp;
    else{
      tmp="";
      var tp=this.exam.set.split("<br/><br/>");
      tp[n]=event.target.value;
      for(var i=0;i<a-1;i++) tmp+=tp[i]+"<br/><br/>";
      tmp+=tp[a-1];
      this.exam.set=tmp;
    }
    //当其是已做且可判断的时候，进行自动判断
    if(this.exam.done>0&&this.exam.typeShow!=5&&this.exam.typeShow!=8) this.check();
    this.saveQuestionRecord();
  }
  //分录题2

  //不定项
  getType6(n:number,m:number){
    if(m>0){
      m--;
      var tmp=this.exam.set;
      var tp=this.exam.answer.split('<br/><br/>')[n];
      if(tmp=="") return "";
      else{
        tmp=tmp.split("<br/><br/>")[n];
        if(tmp.indexOf(String.fromCharCode(m+65))<0) return '';
        else{
          if(this.exam.done==0) return 'exam-botton-choose';
          else {
            if(tmp==tp) return 'exam-botton-right';
            else return 'exam-botton-wrong';
          }
        }
      }
    }
  }
  setType6(n:number,m:number){
    if(m>0){
      m--;
      var tmp="";
      var a=this.getContentLength;
      for(var i=0;i<a-1;i++){
        if(i==n) tmp+=String.fromCharCode(m+65)+"<br/><br/>";
        else tmp+="<br/><br/>";
      }
      if(n==a-1) tmp+=String.fromCharCode(m+65);
      else tmp+="";
      if(this.exam.set=="") this.exam.set=tmp;
      else{
        tmp="";
        var tp=this.exam.set.split("<br/><br/>");
        if(tp[n].indexOf(String.fromCharCode(m+65))<0) tp[n]+=String.fromCharCode(m+65);
        else tp[n]=tp[n].replace(String.fromCharCode(m+65),"");
        tp[n]=this.bubble_sort(tp[n]);
        for(var i=0;i<a-1;i++) tmp+=tp[i]+"<br/><br/>";
        tmp+=tp[a-1];
        this.exam.set=tmp;
      }
      //console.log(this.exam.set);
      if(this.exam.done>0) this.check();
      this.saveQuestionRecord();
    }
  }

  //不定项9
  setType9(n:number,m:number){
    if(m>0){
      m--;
      var tmp="";
      var a=this.getContentLength;
      for(var i=0;i<a-1;i++){
        if(i==n) tmp+=String.fromCharCode(m+65)+"<br/><br/>";
        else tmp+="<br/><br/>";
      }
      if(n==a-1) tmp+=String.fromCharCode(m+65);
      else tmp+="";
      if(this.exam.set=="") this.exam.set=tmp;
      else{
        tmp="";
        var tp=this.exam.set.split("<br/><br/>");
        if(tp[n].indexOf(String.fromCharCode(m+65))<0) tp[n]=String.fromCharCode(m+65);
        for(var i=0;i<a-1;i++) tmp+=tp[i]+"<br/><br/>";
        tmp+=tp[a-1];
        this.exam.set=tmp;
      }
      //console.log(this.exam.set);
      if(this.exam.done>0) this.check();
      this.saveQuestionRecord();
    }

  }
  handc(){
    let prompt = this.alertCtrl.create({
      title: '手动判断',
      subTitle: "系统无法自动判断此类题型的答案，请根据参考答案估值",
      inputs:[
        {
          type:'radio',
          label:'100 (完全正确)',
          value:'1',
          checked:true
        },
        {
          type:'radio',
          label:'80',
          value:'0.8'
        },
        {
          type:'radio',
          label:'60',
          value:'0.6'
        },
        {
          type:'radio',
          label:'40 ',
          value:'0.4'
        },
        {
          type:'radio',
          label:'20',
          value:'0.2'
        },
        {
          type:'radio',
          label:'0 (完全错误)',
          value:'2'
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
            this.exam.done=parseFloat(data);
            console.log(data);
          }
        }
      ]
    });
    prompt.present();
  }
  sendError(){
    //$(".darklayer").show();
    let modal = this.modalCtrl.create(ErrorPage,{token:this.token,id:this.exam.id});
    modal.present();
  }
  getNote(){
    this.navCtrl.push(NotePage,{id:this.exam.id,type:7});
  }
  check(){
    if(this.exam.set=="") this.exam.done==0;
    else{
      if(this.exam.typeShow==5||this.exam.typeShow==8) {
        if(this.exam.done==0) this.exam.done=3;
      }
      else{
        if(this.exam.set==this.exam.answer) this.exam.done=1;
        else{
          if(this.exam.typeShow==4||this.exam.typeShow==6||this.exam.typeShow==7||this.exam.typeShow==9){
            let as1=this.exam.answer.split("<br/><br/>");
            let as2=this.exam.set.split("<br/><br/>");
            let count=0;
            for(let i=0;i<as1.length;i++){
              if(as1[i]==as2[i]) count++;
            }
            if(count==0) this.exam.done=2;
            else this.exam.done=count/as1.length;
            //else this.exam.done=parseFloat((count/as1.length).toFixed(1));
          }
          else this.exam.done=2;
        }
        //else this.exam.done=2;
        //分录题数字或者不定项
      }

    }
    //console.log(this.exam.done);
  }
  checkAll(){
    /*
    this.callback=(params)=>{
      return new Promise((resolve, reject)=>{
        this.exams=params;
        this.mode=true;
        this.id=0;
        this.exam=this.exams[this.id];
        this.all=this.exams.length;
        this.allarr=new Array(this.all);
        this.time=0;
        resolve();
      })
    }
    this.navCtrl.push(ScorePage,{exams:this.sexam,mode:this.time,callback:this.callback,check:this.check});
    */
    //if(this.callback==null) this.navCtrl.push(ScorePage,{subject:this.subject,title:this.title,exams:this.exams, mode:this.time, check:this.check});
    //else this.callback("").then(this.navCtrl.pop())
    this.navCtrl.push(ScorePage,{subject:this.subject,title:this.title,exams:this.exams, mode:this.time, check:this.check}).then(()=>{this.viewCtrl.dismiss()});
  }
  prev(){
    this.ans=true;
    if(this.id>0){
      this.id--;
      this.exam=this.exams[this.id];
    }
    $(".scroll-content").scrollTop(0)
  }
  next(){
    this.ans=true;
    if(this.id<this.all-1){
      this.id++;
      this.exam=this.exams[this.id];
    }
    $(".scroll-content").scrollTop(0)
  }
  swipe(event:any){
    if(event.direction==2) this.next();
    if(event.direction==4) this.prev();
  }
  getDtk(){
    this.setDtk=(params)=>{
      return new Promise((resolve,reject)=>{
        this.id=params;
        this.exam=this.exams[this.id];
        resolve();
      })
    };
    let modal = this.modalCtrl.create(DtkPage,{exams:this.exams,setDtk:this.setDtk});
    modal.present();
    /*
    if(this.exams[i].done==0){
      if(this.exams[i].set=="") return '';
      else return 'exam-botton-choose';
    }
    else{
      if(this.exams[i].done==1) return 'exam-botton-right';
      else return 'exam-botton-wrong';
    }
    */
  }
  get:any;
  setGet(){
    if(this.get){
      this.get=false;
      this.exam.get=0;
    }
    else{
      this.get=true;
      this.exam.get=1;
    }
  }
  /*
  ionViewDidLoad(){
    $(".exam-dtk").hide();
  }
  */
  goBack(){
    this.navCtrl.pop();
  }
  ionViewWillLeave(){
    clearInterval(this.jsq);
  }
  ionViewDidLeave(){
    clearInterval(this.jsq);
  }
}
