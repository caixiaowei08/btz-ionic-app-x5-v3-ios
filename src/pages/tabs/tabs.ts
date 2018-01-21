import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { LivePage } from '../live/live';
import { MinePage } from '../mine/mine';


@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;
  //params:any;
  constructor() {
    this.tab1Root = HomePage;
    this.tab2Root = LivePage;
    this.tab3Root = MinePage;
    //this.params={ref:true};
  }
}
