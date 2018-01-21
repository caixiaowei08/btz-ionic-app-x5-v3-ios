import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'page-buyvip',
  templateUrl: 'buyvip.html'
})

export class BuyvipPage {
  constructor(private iap: InAppPurchase,private alertCtrl: AlertController) {

  }


  doBuy(){
    this.iap
      .buy('btzvip01')
      .then((data)=> {
        this.presentAlert( "doBuy1"+JSON.stringify(data));
        console.log("AAA:"+JSON.stringify(data));
      })
      .catch((err)=> {
        this.presentAlert("dobuy2"+ JSON.stringify(err));
        console.log("BBB:"+JSON.stringify(err));
      });
  }

  getAllProducts(){
    this.iap
      .getProducts(['btzvip01'])
      .then((products) => {
        this.presentAlert(JSON.stringify(products));
        console.log(JSON.stringify(products));
      })
      .catch((err) => {
        this.presentAlert(JSON.stringify(err));
        console.log(JSON.stringify(err));
      });
  }

  restorePurchases(){
    this.iap
      .restorePurchases()
      .then((products) => {
        this.presentAlert(JSON.stringify(products));
        console.log(JSON.stringify(products));
      })
      .catch((err) => {
        this.presentAlert(JSON.stringify(err.erorMessage));
        console.log(JSON.stringify(err));
      });
  }

  presentAlert(msg) {
    let alert = this.alertCtrl.create({
      title: '提示！',
      subTitle: msg,
      buttons: ['Dismiss']
    });
    alert.present();
  }



}
