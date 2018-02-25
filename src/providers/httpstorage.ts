import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
//import 'rxjs/add/operator/map';

@Injectable()
export class HttpStorage {
  //url:string="http://192.168.31.35:8080";
  url:string="http://contact.app.baitizhan.com"
  constructor(private http: Http,private storage:Storage) {
  }

  getHttp(url,callback){
    let obj=this.http.get(this.url+url).subscribe((data)=>{
      callback(data.json());
    },(error)=>{
      callback(null);
    })
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
