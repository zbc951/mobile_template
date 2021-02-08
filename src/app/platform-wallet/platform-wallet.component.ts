import { MemberService, amountType } from './../app-service/member.service';
import { LangService } from './../app-service/lang.service';
import { ToastService } from './../app-service/toast.service';
import { AuthService } from './../app-service/auth.service';
import { PublicService, GameTypeKey } from './../app-service/public.service';
import { pipe } from 'rxjs';
import { HeaderService, actions as headerActions } from './../app-service/header.service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { WalletService, moneyLoadStatus } from './../app-service/wallet.service';
import { Router } from '@angular/router';
import { AppRoutes } from '../constant/routes';
@Component({
  selector: 'app-platform-wallet',
  templateUrl: './platform-wallet.component.html',
  // styleUrls: ['./platform-wallet.component.scss']
})
export class PlatformWalletComponent implements OnInit, OnDestroy {

  isOpen = false;
  @Input() type: string;

  url;
  platformWallet = [];
  @Output() transInEvt = new EventEmitter();

  updateTime;
  $data;

  apiResponseCount = 0;
  isLoading = false;

  constructor(
    private router: Router,
    private walletService: WalletService,
    private headerService: HeaderService,
    private publicService: PublicService,
    private auth: AuthService,
    private toast: ToastService,
    private langService: LangService,
    private memberService: MemberService
  ) {

    this.updateTime = new Date();

    this.url = this.router.url.split('/')[1];

    console.log('url', this.url);

    switch (this.url) {

      case AppRoutes.WITHDRAWAL:

      case AppRoutes.TRANSFER:
      case AppRoutes.MY_WALLET:
        this.$data = this.walletService.getMultiPlatforms()
          .subscribe((res) => {

            // console.log('getMultiPlatforms res', res);

            this.platformWallet = res;
            // console.log('**getTransAllBalance');
            this.getTransAllBalance();

          });
        break;
    }

  }

  ngOnInit(): void {
  }

  open(): void {
    this.isOpen = !this.isOpen;
  }

  @HostListener(`window:${headerActions.MyWalletRefresh}`, ['$event'])
  getTransAllBalance(): void {

    console.log('getTransAllBalance');

    this.updateTime = new Date();

    this.platformWallet.forEach((platform: any) => {

      platform.getStatus = moneyLoadStatus.LOADING;

      this.getMultiBalance(platform);

    });
  }

  getMultiBalance(platform): void {

    console.log('getMultiBalance', platform.key);

    this.walletService.getMultiBalance(platform.key)
      .subscribe(
        (balanceRes: any) => {

          if (balanceRes.result == 'ok') {
            platform.getStatus = moneyLoadStatus.GOT;
            platform.balance = balanceRes.balance;
            platform.activityWallet = balanceRes.activityWallet;
            platform.isShow = false;
          }
        }, (err) => {
          platform.getStatus = moneyLoadStatus.GOT;
        });

  }


  transinAll(item): void {
    this.transInEvt.emit(item);
  }

  showWallet(index) {
    this.platformWallet[index].isShow = true;
    setTimeout(() => {
      this.platformWallet[index].isShow = false;
    }, 3000);
    console.log(index);
  }

  unmountActivityWallet(): void {


    this.isLoading = true;
    this.apiResponseCount = this.platformWallet.length;
    // batch calling
    this.platformWallet.forEach((platform) => {

      this.walletService.unmountActivityWallet({
        platformId: platform.id
      })
        .subscribe(
          (res) => {

            console.log('unmountActivityWallet res', res);
            if (res.result === 'ok') {

              this.getMultiBalance(platform);

            } else {
              this.toast.error(this.langService.translations.SERVER_ERROR);
            }

            this.tellShouldCloseLoading();

          }
          , (err) => {

            if (err.error && typeof err.error === 'string') {
              this.toast.error(err.error);
            }

            this.tellShouldCloseLoading();

          }
        );

    });

    this.updateTime = new Date();
  }

  tellShouldCloseLoading() {
    if (this.apiResponseCount == 0) {
      return;
    }

    this.apiResponseCount--;
    console.log('** tellShouldCloseLoading ', this.apiResponseCount);

    if (this.apiResponseCount == 0) {

      this.auth.getWallet();

      this.memberService.getAmount([
        amountType.able,
        amountType.activity,
        amountType.total])
        .subscribe();

      this.isLoading = false;
    }
  }


  ngOnDestroy(): void {

    this.$data.unsubscribe();

  }

}
