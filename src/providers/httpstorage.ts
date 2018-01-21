import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
//import 'rxjs/add/operator/map';

@Injectable()
export class HttpStorage {
  //url:string="http://59.78.194.121:8080";
  url:string="http://contact.app.baitizhan.com"
  constructor(private http: Http,private storage:Storage) {
  }
  /*
  HS(url, key, callback){
    this.http.get(url).subscribe((data)=>{
      let tmp=data.json();
      if(tmp.returnCode) this.setStorage(key,tmp.content);
      callback(tmp.content);
    },(error)=>{
      this.storage.get(key).then((data) => {
        callback(data)
      })
    })
  }
  */
  getHttp(url,callback){
    let obj=this.http.get(this.url+url).subscribe((data)=>{
      callback(data.json());
    },(error)=>{
      callback(null);
    })
    /*
    setTimeout(() => {
      obj.unsubscribe();
    }, 8000);
    */
  }
  postHttp(url,body,callback){
    this.http.post(this.url+url,body).subscribe((data)=>{
      callback(data.json());
    },(error)=>{
      callback(null);
    })
  }
  getStorage(key,callback){
    this.storage.get(key).then((data) => {
      callback(data);
    })
  }
  setStorage(key,value){
    this.storage.set(key,value);
  }
  delStorage(key){
    this.storage.remove(key);
  }
  delAllStorage(){
    this.storage.clear();
  }
}
