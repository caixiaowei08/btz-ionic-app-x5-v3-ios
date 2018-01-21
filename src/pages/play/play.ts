import { Component } from '@angular/core';
import { ViewController,NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-play',
  templateUrl: 'play.html'
})
export class PlayPage {
  url:any;
  title:any;
  constructor(public viewCtrl: ViewController ,public navCtrl: NavController,public navParams: NavParams) {
    this.url=this.navParams.get("url");
    this.title=this.navParams.get("title");
  }
  dismiss(){
    this.viewCtrl.dismiss();
  }
}
