import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppRoutes } from '../constant/routes';
import { HeaderService } from './../app-service/header.service';

enum Tabs {
  TEACH = 'teach',
  PROBLEM = 'problem',
  ABOUT = 'about',
}

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  // styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  public tabs = Tabs;
  public nowNav: Tabs;
  public selectPresent: any;
  // public nowCnt: string;

  appRoutes = AppRoutes;
  url = '';
  // 存款內文
  serial = true;
  wechat = false;
  wanin = false;
  alipay = false;
  unionpay = false;
  numberdeposit = false;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    public headerService: HeaderService
  ) {
    this.headerService.nowCnt = '';
  }

  ngOnInit(): void {
    this.url = this.router.url.split('/')[1];
    switch (this.url) {
      case this.appRoutes.HELP:
        this.nowNav = Tabs.TEACH;
        this.translateService.get('NAV.NEWBIE')
          .subscribe((trans) => {
            this.setTxt(trans);
          });
        break;

      case this.appRoutes.HELP_PORBLEM:
        this.nowNav = Tabs.PROBLEM;
        this.translateService.get('NAV.QNA')
          .subscribe((trans) => {
            this.setTxt(trans);
          });
        break;

      case this.appRoutes.HELP_ABOUT:
        this.nowNav = Tabs.ABOUT;
        this.translateService.get('NAV.ABOUT')
          .subscribe((trans) => {
            this.setTxt(trans);
          });
        break;
    }
  }

  goNav(val: any) {
    this.nowNav = val.target.value;
    this.headerService.nowCnt = '';

    switch (this.nowNav) {
      case Tabs.TEACH:
        this.router.navigateByUrl(AppRoutes.HELP);
        this.translateService.get('NAV.NEWBIE')
          .subscribe((trans) => {
            this.setTxt(trans);
          });
        break;

      case Tabs.PROBLEM:
        this.router.navigateByUrl(AppRoutes.HELP_PORBLEM);
        this.translateService.get('NAV.QNA')
          .subscribe((trans) => {
            this.setTxt(trans);
          });
        break;

      case Tabs.ABOUT:
        this.router.navigateByUrl(AppRoutes.HELP_ABOUT);
        this.translateService.get('NAV.ABOUT')
          .subscribe((trans) => {
            this.setTxt(trans);
          });
        break;
    }
  }

  // goCnt(t, title) {
  //   this.headerService.nowCnt = t;
  //   this.headerService.setTitle(title);
  //   this.headerService.curType = 7;
  // }

  setTxt(translations): void {
    this.selectPresent = translations;
  }

  toggleDiv(e: any) {
    const target = e.currentTarget.childNodes[3];
    target.checked = target.checked ? false : true;
  }
}
