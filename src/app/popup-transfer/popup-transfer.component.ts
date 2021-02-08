import { Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { GameService } from './../app-service/game.service';
import { MemberService } from './../app-service/member.service';
import { AuthService } from './../app-service/auth.service';
import { WalletService } from '../app-service/wallet.service';

@Component({
  selector: 'app-popup-transfer',
  templateUrl: './popup-transfer.component.html',
  // styleUrls: ['./popup-transfer.component.scss']
})
export class PopupTransferComponent implements OnInit {


  isMultiMoney = false;
  money = 0;
  data;

  platformMoney = 0;
  platformName = '';

  tmpMoney = 0;
  retryCount = 0;
  timeoutId;


  transferWalletForm = new FormGroup({
    walletType: new FormControl(null),
    amount: new FormControl(1),
  });

  getWalletType = [];

  currentWallet = {
    name: '',
    amount: 0,
    isCoupon: false
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private walletService: WalletService,
    private memberService: MemberService,
    private gameService: GameService
  ) {

    this.data = this.gameService.transitionData;
    // console.log('data:', this.data);

    if (!this.data || Object.keys(this.data).length === 0) {

      this.close();

    }


    this.auth.getWalletSub()
      .subscribe((res: boolean) => {
        if (res) {
          this.money = this.auth.user.money;
        }
      });

    const amountCtrl = this.transferWalletForm.controls.amount;

    amountCtrl
      .valueChanges
      .subscribe((val) => {
        if (val < 0) {
          amountCtrl.patchValue(Math.abs(val));
        }

      });

  }

  ngOnInit(): void {


    this.walletService.getAactivityWalletWallets(
      { platformId: this.data.game.platformId })
      .subscribe((res) => {

        // console.log('getAactivityWalletWallets res', res);

        if (res.data && res.data.wallets && res.data.wallets.length > 0) {

          this.getWalletType = res.data.wallets;
          this.getWalletType.forEach((item) => {
            if (item.status === 'mounted') {
              this.transferWalletForm.controls.walletType.patchValue(item.id);
            }
          });

        }

      });


    const data = this.data;
    const { pkey } = data;
    const platforms = this.walletService.multiWalletPlatforms;
    const item = platforms.find((pf) => {
      return pf.key === pkey;
    });

    this.isMultiMoney = (item) ? true : false;

    if (this.isMultiMoney) {

      this.walletService.getMultiBalance(pkey)
        .subscribe((balanceRes: any) => {
          if (balanceRes.result == 'ok') {
            // platform.getStatus = moneyLoadStatus.GOT;
            // platform.balance = balanceRes.balance;
            this.platformMoney = balanceRes.balance;
          }
        });

    }

    this.money = this.auth.user?.money;

  }

  close(): void {
    this.router.navigate([{ outlets: { popup: null } }]);
  }

  // onCurrentWallet(): void {

  //   let walletIndex = this.getWalletType.findIndex(item => item.id === parseInt(this.transferWalletForm.value.walletType));

  //   this.currentWallet.name = this.getWalletType[walletIndex].name;
  //   this.currentWallet.amount = this.getWalletType[walletIndex].amount;
  //   this.currentWallet.isCoupon = this.getWalletType[walletIndex].isCoupon;
  // }

  enter(): void {

    console.log('enter', this.data);
    console.log(this.transferWalletForm.value);
    const walletType = this.transferWalletForm.value.walletType;

    this.data.purchaseLogId = (walletType === 'null') ? null : this.transferWalletForm.value.walletType;

    this.gameService.launchGame2(this.data);
    this.close();

  }
}
