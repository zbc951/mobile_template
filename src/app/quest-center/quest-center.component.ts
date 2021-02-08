import { PublicService } from './../app-service/public.service';
import { Component, OnInit } from '@angular/core';
import { AppRoutes } from '../constant/routes';
import { Router } from '@angular/router';
import {
  WalletService,
  buyResponse,
  Activity_type,
} from './../app-service/wallet.service';

import { ToastService } from './../app-service/toast.service';
import { LangService } from './../app-service/lang.service';
import { AuthService } from './../app-service/auth.service';

enum Tabs {
  ALL = 'all',
  before = 'before',
  after = 'after',
  fixed = 'fixed',
  percent = 'percent',
  stages = 'stages',
}

@Component({
  selector: 'app-quest-center',
  templateUrl: './quest-center.component.html',
  // styleUrls: ['./quest-center.component.scss']
})
export class QuestCenterComponent implements OnInit {
  Activity_type = Activity_type;
  public tabs: any = Tabs;
  public selected: Tabs;
  public listData: any;
  public pageConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0,
  };

  // questData: any[] | null = null;
  public AppRoutes = AppRoutes;

  url;

  questTypes = [];
  quest_method;

  constructor(
    private walletService: WalletService,
    private router: Router,
    private toast: ToastService,
    private langService: LangService,
    private auth: AuthService,
    private publicService: PublicService
  ) {
    this.url = this.router.url.split('/')[1];
    this.langService.onloadSub.subscribe((boo) => {
      if (boo) {
        this.quest_method = this.langService.translations.quest_method;
        this.questTypes = [
          {
            name: this.quest_method.fixed,
            value: Tabs.fixed,
          },
          {
            name: this.quest_method.percent,
            value: Tabs.percent,
          },
          {
            name: this.quest_method.stages,
            value: Tabs.stages,
          },
        ];
      }
    });
  }

  ngOnInit(): void {
    switch (this.url) {
      case AppRoutes.Activity_Wallet:
        this.getActivityWallet();
        break;

      case AppRoutes.QUEST:
        this.initQuest();
        break;
    }

    this.selected = Tabs.ALL;
  }

  selectType(t: Tabs): void {
    this.selected = t;
  }

  initQuest(): void {
    this.publicService.getPublicQuestList().subscribe((response) => {
      // let questList = response.data.content;
      let questList = [];

      response.data.content.forEach((item) => {
        questList.push({
          name: item.quest_name,
          startAt: item.startAt,
          endAt: item.endAt,
          information: item.information,
          image: item.image_url,
          informationDisplay: item.info_display,
          method: item.method,
          type: item.type,
        });
      });

      this.listData = questList;
    });
  }

  getActivityWallet(): void {
    this.walletService.getActivityWallet().subscribe((res) => {
      // console.log('getActivityWallet', res);
      this.listData = res.data.products;
    });
  }

  goDetail(data): void {
    this.walletService.tmpActivity = data;
    this.router.navigateByUrl(AppRoutes.QUEST_DETAIL);
  }

  buy(item): void {
    if (this.auth.user.money < item.price) {
      this.toast.error(
        this.langService.translations.QUEST_CENTER.buy_moneyNotEnough
      );
      return;
    }

    this.walletService.buy(
      item,
      this.langService.translations.QUEST_CENTER,
      () => {
        this.getActivityWallet();
      }
    );
  }
}
