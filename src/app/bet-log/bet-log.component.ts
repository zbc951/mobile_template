import { LangService } from './../app-service/lang.service';
import { Component, OnInit } from '@angular/core';
import { SelectAlertService, SelectType } from './../app-service/select-alert.service';
import { LogService } from '../app-service/log.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { PublicService } from '../app-service/public.service';

export enum DateType {
  TODAY = 'today',
  YESTEDAY = 'yesteday',
  WEEK = 'week',
  MONTH = 'month'
}
@Component({
  selector: 'app-bet-log',
  templateUrl: './bet-log.component.html',
  // styleUrls: ['./bet-log.component.scss']
})
export class BetLogComponent implements OnInit {

  curPlatform = {
    index: 0,
    item: {
      id: 0,
      name: '',
      key: ''
    }
  };

  curWallet = {
    index: 0,
    item: {
      // id: 0,
      name: '',
      // key: ''
    }
  };

  getWallet = [
    {
      name: '中心錢包'
    },
    // {
    //   name: '活動1'
    // },
    // {
    //   name: '活動2'
    // },
    // {
    //   name: '活動3'
    // },
  ];


  // =====================

  pageConfig: {
    itemsPerPage,
    currentPage,
    totalItems
  } = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: 0,
    };

  form: FormGroup;
  gamePlatforms = [];
  data;

  betRecord = [];
  betDetails = [];
  betDetailId = -1;
  betQry: {
    platformId: number,
    // betTime: string,
    page?: number,
    startTime: string,
    endTime: string
  };

  sumTotal: {
    betAmount: number,
    resultAmount: string,
    subtotal: string,
    validAmount: number
  } = null;

  betSumTotal: any = {};
  isMoreHidden = true;

  constructor(
    private selectAlertService: SelectAlertService,
    private formBuilder: FormBuilder,
    private logService: LogService,
    private publicService: PublicService,
    private langService: LangService
  ) {

    this.form = this.formBuilder.group({
      startTime: '',
      endTime: '',
      platformId: []
    });

    this.langService.onloadSub
      .subscribe((boo) => {

        const translations = this.langService.translations;
        const ALL_PLATFORM = translations.BET_LOG.ALL_PLATFORM;

        const opt = {
          id: 'all',
          name: ALL_PLATFORM,
          key: 'all'
        };
        this.gamePlatforms = [...this.publicService.platforms.platforms];
        this.gamePlatforms.unshift(opt);
        this.curPlatform.item = this.gamePlatforms[0];
        this.form.controls.platformId.patchValue(this.gamePlatforms[0].id);

        const ALL_ACCOUNT = translations.BET_LOG.ALL_ACCOUNT;

        this.getWallet.unshift({ name: ALL_ACCOUNT });
        this.curWallet.item = this.getWallet[0];
      });
  }

  ngOnInit(): void {

  }

  queryBet(onBtm = false): void {


    if (!onBtm) {
      this.betRecord = [];
    }

    const formdata = Object.assign({}, this.form.value);

    formdata.page = this.pageConfig.currentPage;
    formdata.perPage = this.pageConfig.itemsPerPage;

    console.log('platformId', this.form.value.platformId);

    if (this.form.value.platformId === 'all') {

      formdata.platformId = this.gamePlatforms
        .map((item) => {
          return item.id;
        })
        .filter((item) => {
          return typeof item === 'number';
        });

    } else {

      formdata.platformId = [this.form.value.platformId];

    }

    // test
    // formdata.startTime = '2020-07-01';

    console.log('fomrdata', formdata);

    this.logService.perDaySumBetLog(formdata)
      .subscribe((res: any) => {

        console.log("perDaySumBetLog res", res);

        if (res.data) {

          this.pageConfig.currentPage = res.data.page;
          this.pageConfig.totalItems = res.data.total;

          for (const i in res.data.content) {
            this.betRecord.push(res.data.content[i]);
          }

          this.sumTotal = res.data.sumTotal;
        }

      });

  }


  getBetDetail(idx, item): void {

    console.log('getBetDetail', item, 'idx', idx, this.betDetailId);

    // if (this.betDetailId == idx) {
    //   this.betDetailId = -1;
    //   return;
    // }

    item.isOpen = !item.isOpen;

    this.betDetailId = idx;
    this.betQry = {
      platformId: item.platformId,
      page: 1,
      startTime: item.startTime,
      endTime: item.endTime
    };

    if (item.isOpen == false) {
      return;
    }

    this.betDetails = [];
    this.getBetLog();

  }


  getBetLog(): void {
    this.logService.betLog(this.betQry)
      .subscribe((res: any) => {

        this.betDetails = this.betDetails.concat(res.data.content);

        this.isMoreHidden = res.data.total === 0 ? false : res.data.total !== this.betDetails.length;
        // console.log(this.isMoreHidden);

      });
  }

  moreBetLog(): void {

    console.log('moreBetLog');

    this.betQry.page += 1;
    this.getBetLog();
  }


  open(item): void {
    item.isOpen = !item.isOpen;
  }

  platformChoose(curPlatform): void {

    const data = this.gamePlatforms;

    // console.log('platformChoose', data);

    this.selectAlertService.open(
      data,
      () => {
        this.curPlatform = this.selectAlertService.cur;
        this.form.controls.platformId.patchValue([this.curPlatform.item.id]);
      },
      curPlatform,
      SelectType.Platform);
  }

  walletChoose(curWallet): void {

    const data = this.getWallet;

    this.selectAlertService.open(data,
      () => {
        this.curWallet = this.selectAlertService.cur;
      },
      curWallet,
      SelectType.Wallet);
  }



  setTime(evt): void {

    this.form.controls.startTime.patchValue(evt.start);
    this.form.controls.endTime.patchValue(evt.end);
  }

  onBtm(evt): void {

    // console.log('onBtm evt', evt, this.pageConfig, this.betRecord.length);

    if (this.betRecord.length < this.pageConfig.totalItems) {

      this.pageConfig.currentPage++;
      this.queryBet(true);
    }
  }

  onDetailBtm(evt): void {

    // console.log('onDetailBtm', evt, this.isMoreHidden);
    if (this.isMoreHidden) {
      this.moreBetLog();
    }

  }


}
