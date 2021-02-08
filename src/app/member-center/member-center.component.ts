import { TranslateService } from '@ngx-translate/core';
import { SelectAlertService, SelectType } from './../app-service/select-alert.service';
import { Router } from '@angular/router';
import { PublicService } from './../app-service/public.service';
import { AppRoutes } from './../constant/routes';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../app-service/auth.service';

@Component({
  selector: 'app-member-center',
  templateUrl: './member-center.component.html',
  // styleUrls: ['./member-center.component.scss']
})
export class MemberCenterComponent implements OnInit {

  AppRoutes = AppRoutes;
  user;
  lv;
  langs = [
    {
      name: '繁體中文',
      key: 'zh-Hant'
    },
    {
      name: '简体中文',
      key: 'zh-Hans'
    }];

  curLang = {
    index: 0,
    item: this.langs[0]
  };

  constructor(
    private auth: AuthService,
    private publicService: PublicService,
    private router: Router,
    private SelectAlertService: SelectAlertService,
    private translate: TranslateService
  ) {

    const idx = this.langs.findIndex((item) => {

      return item.key === this.translate.currentLang;

    });

    this.curLang = {
      index: idx,
      item: this.langs[idx]
    };


  }

  ngOnInit(): void {

    this.user = this.auth.user;
    this.lv = this.user.clubRank.split(')')[1].trim();
  }

  logout(): void {
    this.publicService.logout()
      .subscribe((res) => {

        // this.isLogin = false;
        this.user = {};
        this.router.navigateByUrl(AppRoutes.HOME);
      });
  }

  selectLang(): void {

    this.SelectAlertService.open(
      this.langs,
      () => {

        this.curLang = this.SelectAlertService.cur;
        this.translate.use(this.curLang.item.key);

      },
      this.curLang,
      SelectType.Lang
    );

  }

}
