import { debounceTime } from 'rxjs/operators';
import { MemberService, amountType } from './../app-service/member.service';
import { WalletService, moneyLoadStatus, WalletType } from './../app-service/wallet.service';
import { HeaderService, actions as headerActions } from './../app-service/header.service';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppRoutes } from '../constant/routes';
import { AuthService } from './../app-service/auth.service';
import { combineLatest, Observable } from 'rxjs';

enum tips {
  none,
  sum,
  withdraw
}

@Component({
  selector: 'app-my-wallet',
  templateUrl: './my-wallet.component.html',
  // styleUrls: ['./my-wallet.component.scss']
})
export class MyWalletComponent implements OnInit, OnDestroy {

  AppRoutes = AppRoutes;
  WalletType = WalletType;
  curWalletType = WalletType.COUPON;
  tips = tips;
  nowTip = tips.none;

  user;
  // userMoney;
  walletSumup = 0;

  total_0 = 0;
  total = 0;

  ableMoney = 0;
  platformWallet = [];

  $data;

  constructor(
    private auth: AuthService,
    private headerService: HeaderService,
    private walletService: WalletService,
    private memberService: MemberService
  ) {

    this.user = this.auth.user;

    // this.userMoney = String(this.user.money);
    // console.log(this.userMoney);

    this.total = this.user.money;

    this.auth.getWallet();
    this.auth.getWalletSub()
      .subscribe((res: boolean) => {
        if (res) {
          // console.log('getWalletSub', res);
          this.user = this.auth.user;
        }
      });

    this.$data = combineLatest([
      this.walletService.getMultiPlatforms(),
      this.memberService.getAmountSub()
    ])
      .pipe(debounceTime(500))
      .subscribe((res: any[]) => {

        // console.log('** combineLatest res', res);

        this.platformWallet = res[0];
        const amountdata = res[1];

        if (amountdata.data && this.platformWallet.length > 0) {

          this.total = this.total_0 = parseFloat(amountdata.data.total_money);
          this.ableMoney = Number(amountdata.data.able_money);
          this.walletSumup = amountdata.data.activity_wallet_total;

          this.getTransAllBalance();
        }

      });

  }

  ngOnInit(): void {

    this.getAmount();

  }

  ngOnDestroy(): void {

    this.$data.unsubscribe();

  }

  typeChange(type): void {
    this.curWalletType = type;
  }


  showTips(t): void {

    if (t == this.nowTip) {
      this.nowTip = tips.none;
      return;
    }

    this.nowTip = t;

  }

  getAmount(): void {

    this.memberService.getAmount([
      amountType.able,
      amountType.activity,
      amountType.total])
      .subscribe();
  }

  getTransAllBalance(): void {

    this.platformWallet.forEach((platform: any) => {

      platform.getStatus = moneyLoadStatus.LOADING;

      this.walletService.getMultiBalance(platform.key)
        .subscribe(
          (balanceRes: any) => {

            if (balanceRes.result == 'ok') {
              platform.getStatus = moneyLoadStatus.GOT;
              platform.balance = Number(balanceRes.balance);


              let tmpSum = 0;
              this.platformWallet.forEach((p: any) => {

                tmpSum += Number(p.balance);
              });

              this.total = Number(this.total_0) + tmpSum;
              // this.total = this.total + parseFloat((balanceRes.balance).toString());
            }
          }, (err) => {
            platform.getStatus = moneyLoadStatus.GOT;
          });
    });
  }

  @HostListener(`window:${headerActions.MyWalletRefresh}`, ['$event'])
  refresh(evt): void {

    // console.log('refresh');

    this.auth.getWallet();
    this.getAmount();
  }


}
