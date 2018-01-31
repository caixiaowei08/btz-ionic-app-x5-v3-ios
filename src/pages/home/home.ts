import {Component, ViewChild} from '@angular/core';
import {AlertController, ModalController, NavController, NavParams, Slides} from 'ionic-angular';
import {HttpStorage} from '../../providers/httpstorage';

import {ListPage} from '../list/list';
import {ListDPage} from '../listd/listd';
import {SimuPage} from '../simu/simu';
import {NotePage} from '../note/note';
import {FramePage} from '../frame/frame';
import * as $ from "jquery";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Slides) slide: Slides;
  //用户选择
  subject: any = {id: 0, name: '载入中...', exam: 0, video: 0, time: 0}
  //bookpage
  seg: any = 0;
  segi: any = 0;
  segj: any = 0;
  subs: any;
  //每日推荐
  slides: any;
  //用户分数
  score: { right: number, all: number };
  //用户内容
  cards: any;
  data: any;
  test: any;
  token: any;

  constructor(public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              public navCtrl: NavController,
              public navParams: NavParams,
              public httpstorage: HttpStorage) {
    //this.httpstorage.delStorage("play")
    //this.httpstorage.delAllStorage();
    this.token = "";
    this.slides = [{img: '', url: ''}];
    this.score = {right: 0, all: 0};
    this.cards = [
      {pic: 'url(assets/images/item2.png)', tit: '', txt: '配合视频学习,系统学习'},
      {pic: 'url(assets/images/item1.png)', tit: '', txt: '边学边练,巩固知识点'},
      {pic: 'url(assets/images/item3.png)', tit: '', txt: '边学边练,巩固知识点'},
      {pic: 'url(assets/images/item4.png)', tit: '', txt: '边学边练,巩固知识点'},
      {pic: 'url(assets/images/item4.png)', tit: '', txt: '边学边练,巩固知识点'}
    ];
    this.getUser();
  }

  fixtit(n) {
    if (n.length <= 7) return n;
    else return n.substr(0, 7) + "...";
  }

  getSubject(i, j) {
    let tmp = this.subs[i].children[j];
    return {
      id: tmp.subCourseId,
      name: tmp.subCourseName,
      exam: tmp.examAuth,
      video: tmp.videoAuth,
      videoClass: tmp.videoClass,
      time: tmp.expirationTime

    }
  }

  setSubject(i, j) {
    this.segi = i;
    this.segj = j;
    this.choose();
    this.subject = this.getSubject(i, j);
    this.httpstorage.setStorage("subject", this.subject);
    this.getSubsItemAll();
    this.getScore();
    this.getSlides();
  }

  getUser() {
    this.httpstorage.getStorage("user", (data) => {
      this.token = data.token;
      this.getSubs(data.token);
    })
  }

  getSubs(token: any) {
    this.httpstorage.getHttp('/app/appSubCourseController.do?getCourseInfoByToken&token=' + token, (data) => {
      if (data != null) { //有网
        if (data.returnCode) {//有数据
          this.subs = data.content;
          this.httpstorage.setStorage("subs", this.subs);
          this.subject = this.getSubject(0, 0);
          this.httpstorage.setStorage("subject", this.subject);
        }
        else {//无数据
          this.subject.id = 0;
          this.subject.name = data.msg;
          this.httpstorage.setStorage("subject", this.subject);
        }
        this.getSubsItemAll();
        this.getScore();
        this.getSlides();
      }
      else {//无网
        this.httpstorage.getStorage("subs", (data) => {
          if (data != null) {
            this.subs = data;
            this.subject = this.getSubject(0, 0);
            this.httpstorage.setStorage("subject", this.subject);
            this.getSubsItemAll();
            this.getScore();
            this.getSlides();
          }
          else {
            this.subject.id = 0;
            this.subject.name = '网络未连接';
            this.httpstorage.setStorage("subject", this.subject);
          }
          /*
          this.httpstorage.getStorage("subject",(data)=>{
            if(data!=null) this.subject=data;
            this.getSubsItemAll();
          })
          */
        })
      }
    })
  }

  //核心考点
  subsItem: any = [0, 0, 0, 0, 0];

  getSubsItemAll() {
    this.getSubsItem(this.subject, 1);
    this.getSubsItem(this.subject, 2);
    if (this.token != "") {
      this.getSubsItem(this.subject, 3);
      this.getSubsItem(this.subject, 4);
      this.getSubsItem(this.subject, 5);
    }
  }

  getSubsItem(subject: any, type: any) {
    this.subsItem = [0, 0, 0, 0, 0];
    let id = subject.id;
    let moduleType;
    //let time=subject.time,currentTime=new Date().getTime();
    switch (type) {
      case 1:
        moduleType = 1;
        break;
      case 2:
        moduleType = 2;
        break;
      case 3:
        moduleType = 3;
        break;
      case 4:
        moduleType = 4;
        break;
      case 5:
        moduleType = 7;
        break;
      default:
        moduleType = 0;
        break;
    }

    if (id != 0) {
      this.httpstorage.getHttp('/app/appModuleController.do?getModuleBySubCourseIdAndModuleType&subCourseId=' + id + '&moduleType=' + moduleType, (data) => {
        if (data != null) { //有网
          if (data.returnCode) { //有数据
            this.subsItem[type - 1] = 1;
            //如果本地没有，则保存版本号
            let tmp = data.content.alias;
            this.cards[type - 1].tit = tmp;
            this.httpstorage.setStorage("s" + id + "i" + type + "n", tmp);
          }
        }
        else {//无网，从本地加载
          this.httpstorage.getStorage("s" + id + "i" + type + "n", (data) => {
            if (data != null) {
              this.subsItem[type - 1] = 1;
              this.cards[type - 1].tit = data;
            }
          })
        }
      })
      //试题策略
      this.httpstorage.getHttp('/app/strategyController.do?doGetStrategyBySubCourseId&subCourseId=' + id, (data) => {
        if (data != null && data.returnCode) {
          this.httpstorage.setStorage("s" + id + "s", data.content);
        }
      })
    }
  }

  getSlides() {
    this.httpstorage.getHttp('/app/carouselController.do?getCarousel&subCourseId=' + this.subject.id, (data) => {
      if (data != null) {
        if (data.returnCode) {
          this.slides = data.content;
          this.slide.startAutoplay();
        }
        else {
          this.httpstorage.getHttp('/app/carouselController.do?getCarousel', (data) => {
            if (data != null) {
              if (data.returnCode) {
                this.slides = data.content;
                this.slide.startAutoplay();
              }
            }
          })
        }
      }
      //this.slide.startAutoplay();
    })
  }

  slidec() {
    let index = this.slide.realIndex;
    this.navCtrl.push(FramePage, {title: '百题斩', url: this.slides[index].url});
    //this.navCtrl.push(FramePage,{title:'百题斩',url:url});
  }

  getslide(i) {
    return "url(" + this.slides[i].img + ")";
  }

  choose() {
    //let modal = this.modalCtrl.create(BookPage, {subject: this.subject});
    //modal.present();
    $(".tabbar").toggle();
    $(".bookbt").toggleClass("bookbtt");
    $("#bookpage").slideToggle("normal");
  }

  list(n: number) {
    switch (n) {
      case 0:
        //核心考点
        this.navCtrl.push(ListPage, {subject: this.subject, title: this.cards[n].tit, type: n});
        break;
      case 1:
        //章节练习
        this.navCtrl.push(ListPage, {subject: this.subject, title: this.cards[n].tit, type: n});
        break;
      case 2:
        //模拟考场
        this.navCtrl.push(SimuPage, {subject: this.subject, title: this.cards[n].tit, type: n});
        break;
      case 3:
        //考前押题
        this.navCtrl.push(ListPage, {subject: this.subject, title: this.cards[n].tit, type: n});
        break;
      case 4:
        //考前押题
        this.navCtrl.push(ListPage, {subject: this.subject, title: this.cards[n].tit, type: n});
        break;
      case 10:
        this.navCtrl.push(ListDPage, {subject: this.subject, title: "错题", type: n});
        break;
      case 11:
        this.navCtrl.push(ListDPage, {subject: this.subject, title: "收藏", type: n});
        break;
      case 12:
        this.navCtrl.push(NotePage, {subject: this.subject, type: n});
        break;
    }
    //this.navCtrl.push(ListPage,{subject:this.subject,type:str});
  }

  ionViewDidLoad() {
    this.slide.autoplayDisableOnInteraction = false;
  }

  ionViewDidEnter() {
    let getScore = this.getScore.bind(this);
    setTimeout(function () {
      getScore();
    }, 500)
  }

  ionViewDidLeave() {
    //this.slide.stopAutoplay();
  }

  getScore() {
    let all = 0, right = 0;
    this.httpstorage.getStorage("s" + this.subject.id + "i1", (data) => {
      if (data != null) {
        let tmp = data.exam;
        for (let i = 0; i < tmp.length; i++) {
          if (tmp[i].done > 0 && tmp[i].done < 3) {
            all++;
          }
          if (tmp[i].done == 1) {
            right++;
          }
        }
      }
      this.httpstorage.getStorage("s" + this.subject.id + "i2", (data) => {
        if (data != null) {
          let tmp = data.exam;
          for (let i = 0; i < tmp.length; i++) {
            if (tmp[i].done > 0 && tmp[i].done < 3) {
              all++;
            }
            if (tmp[i].done == 1) {//作答正确
              right++;
            }
          }
        }
        this.score.all = all;
        this.score.right = right;
      })
    })
  }
}
