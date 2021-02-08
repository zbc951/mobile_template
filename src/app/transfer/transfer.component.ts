import { MemberService, amountType } from './../app-service/member.service';
import { PublicService } from './../app-service/public.service';
import { Component, OnInit } from '@angular/core';
import { ToastService } from './../app-service/toast.service';
import { WalletService, moneyLoadStatus } from './../app-service/wallet.service';
import { AuthService } from './../app-service/auth.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { LangService } from './../app-service/lang.service';
import { TranslateService } from '@ngx-translate/core';

export enum WalletType {
  COUPON = 'coupon-wallet',
  PLATFORM = 'platform-wallet'
}

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  // styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  // isAuto = true;
  type = 'transfer';
  WalletType = WalletType;
  curWalletType = WalletType.COUPON;

  user;
  allPlatforms;
  platforms;
  transferform: FormGroup;
  transferBackform: FormGroup;
  autoCtrl: FormControl;

  getWalletType = [
    {
      id: '',
      name: '中心錢包',
    },
  ];

  couponWallets = [];
  centerWalletTxt = '';
  isLoading = false;

  platformsWithWallet = [];
  walletSumup = 0;


  platformWallet = [];
  apiResponseCount = 0;

  constructor(
    private auth: AuthService,
    private walletService: WalletService,
    private toast: ToastService,
    private formBuilder: FormBuilder,
    private langService: LangService,
    private publicService: PublicService,
    private translateService: TranslateService,
    private memberService: MemberService
  ) {

    this.translateService.get('PFTRANSITION.CENTER')
      .subscribe((res: any) => {

        this.centerWalletTxt = res;

      });


    this.autoCtrl = new FormControl(true);

    this.transferform = this.formBuilder
      .group({
        platform: null,
        amount: null,
        wallet: ''
      });

    this.transferBackform = this.formBuilder
      .group({
        item: -1,
        wallet: '',
      });

    this.transferBackform.controls.item
      .valueChanges
      .subscribe((itemId) => {

        console.log('Platform.valueChanges', itemId);

        const item = this.platformsWithWallet.find((item) => {

          return item.id == itemId;

        });

        if (item) {

          const name = item.log ? item.log.name : this.centerWalletTxt;
          this.transferBackform.controls.wallet.patchValue(name);

        }


      });

    this.publicService.getPlatforms()
      .subscribe((res: any) => {

        this.platforms = res.platforms;
        this.allPlatforms = res.platforms;
        this.transferform.controls.platform.patchValue(this.platforms[0]);

      });

    this.auth.getWalletSub()
      .subscribe(
        this.refreshMoney.bind(this)
      );

    this.memberService.getAmount([
      amountType.activity
    ])
      .subscribe((res: any) => {
        console.log('getAmount', res);
        this.walletSumup = res.data.activity_wallet_total;
      });

    this.walletService.getMultiPlatforms()
      .subscribe((res) => {

        this.platformWallet = res;

      });
    ;

  }

  ngOnInit(): void {

    this.user = this.auth.user;
    this.transferform.controls.wallet
      .valueChanges
      .subscribe((id) => {
        console.log('couponWallet valueChanges', id);

        this.getPlatformOfWallet(id);

      });

    this.getUserWalletAll();
    this.getPlatformWallet();

  }

  getUserWalletAll(): void {

    this.walletService.getUserWalletAll()
      .subscribe((res) => {

        // console.log('getUserWalletAll', res);
        this.couponWallets = res.data.wallets;
      });
  }


  getPlatformOfWallet(pid): void {

    // console.log('getPlatformOfWallet', pid);

    if (pid) {

      const wallet = this.couponWallets.find((item) => {
        return item.id == pid;
      });

      // console.log('wallet', wallet);
      // console.log(this.platforms);

      let tmpArr = [];

      this.allPlatforms.forEach((item) => {

        if (wallet.platforms.includes(item.id)) {
          tmpArr.push(item);
        }

      });


      // console.log('tmpArr', tmpArr);
      this.platforms = tmpArr;


    } else {

      this.platforms = this.allPlatforms;
    }

  }

  typeChange(type) {
    this.curWalletType = type;
  }

  amountOnChange(item): void {
    // this.transferWalletForm.value.amount = item;
    // console.log(this.transferWalletForm);
    this.transferform.controls.amount.patchValue(item);

  }


  transferPlatforms() {
    // console.log('form', this.transferform);
    const form = this.transferform;

    if (form.invalid) {
      return;
    }

    // console.log(form.value);
    this.transferIn();

  }

  transferIn(): void {

    this.isLoading = true;

    const p = this.transferform.value.platform.id;
    const w = this.transferform.value.wallet;

    const data = {
      platformId: p,
      purchaseLogId: w
    };

    this.walletService.mountActivityWallet(data)
      .subscribe((res) => {
        if (res.result === 'ok') {

          this.transferMsg(res);

          this.auth.getWallet();
          // this.ngOnInit();
          // this.refreshAll();

        } else {
          this.toast.error(this.langService.translations.SERVER_ERROR);
        }
      },
        (err) => {

          // console.log('err', err);
          this.toast.error(err.error);

        }).add(
          () => {
            this.isLoading = false;
            this.getPlatformWallet();
          });

  }


  getTransAllBalance() {

    console.log('getTransAllBalance');

    this.platforms.forEach((platform: any) => {

      // platform.getStatus = moneyLoadStatus.LOADING;

      console.log('getMultiBalance', platform.key);
      this.walletService.getMultiBalance(platform.key)
        .subscribe(
          (balanceRes: any) => {


            if (balanceRes.result == 'ok') {
              // platform.getStatus = moneyLoadStatus.GOT;
              platform.balance = balanceRes.balance;
            }
          }, (err) => {
            // platform.getStatus = moneyLoadStatus.GOT;
          });
    });
  }

  refreshMoney(res) {
    // console.log('refreshMoney res', res, this.auth.user.money);
    // this.money = this.auth.user.money;
    this.user = this.auth.user;

  }

  refreshAll(): void {

    console.log('refreshAll');

    this.auth.getWallet();
    this.walletService.getMultiWalletPlatforms();
    this.walletService.getActivityWalletLogBySubject();

  }

  transferMsg(res): void {

    let unmountPlatform = this.allPlatforms.find((p) => {

      return p.id == res.unmount.platformId;

    });

    if (res.unmount.walletId == null) {
      unmountPlatform = {
        name: this.centerWalletTxt
      };
    }

    const mountPlatform = this.allPlatforms.find((p) => {

      return p.id == res.mount.platformId;

    });

    if (res.mount.walletId == null) {

      res.mount.walletName = this.centerWalletTxt;
    }


    const key = res.unmount.walletId == 0 ? 'TRANSFER.MANUAL.MSG1' : 'TRANSFER.MANUAL.MSG0';

    // console.log('key', key, unmountPlatform, mountPlatform);
    if (res.unmount.walletId == 0) {
      this.translateService.get(key, {

        mount: {
          platformName: mountPlatform.name,
          amount: res.mount.amount,
          walletName: res.mount.walletName
        }

      })
        .subscribe((res) => {

          // console.log('transferMsg res', res);

          this.toast.error(res);
          this.refreshAll();
          this.walletService.getMultiWalletPlatforms();
        });

    } else {
      this.translateService.get(key, {

        unmount: {
          platformName: unmountPlatform.name,
          amount: res.unmount.amount,
          walletName: res.unmount.walletName
        },
        mount: {
          platformName: mountPlatform.name,
          amount: res.mount.amount,
          walletName: res.mount.walletName
        }

      })
        .subscribe((res) => {

          // console.log('transferMsg res', res);

          this.toast.error(res);
          this.refreshAll();
          this.walletService.getMultiWalletPlatforms();
        });
    }
  }


  /**
 * for platform backto activity-wallet
 * list of platform with activity
 */

  getPlatformWallet() {

    this.walletService.getPlatformWallet()
      .subscribe((res) => {

        console.log('getPlatformWallet', res);

        this.platformsWithWallet = res;


      });

  }

  unmount() {

    console.log('unmount', this.transferBackform.value);

    const item = this.platformsWithWallet.find((item) => {

      return item.id == this.transferBackform.value.item;

    });

    if (item) {

      console.log('item', item);
      // return;

      this.walletService.unmountActivityWallet({
        platformId: item.platform.id
      }).subscribe(
        (res) => {

          console.log('unmountActivityWallet res', res);
          // console.log('unmountActivityWallet res', res);
          if (res.result === 'ok') {



            // this.unmounting = true;

            // this.getMultiBalance(platform);

            // if (this.currType === walletType.COUPON) {

            //   this.walletService.getActivityWalletLogBySubject();

            // }

          } else {

            this.toast.error(this.langService.translations.SERVER_ERROR);

          }


        },
        (err) => {

          console.log('err', err);
          if (err.error && typeof err.error === 'string') {
            this.toast.error(err.error);

          }


        }).add(() => {

          this.refreshAll();
          this.getPlatformWallet();
          this.getUserWalletAll();
        });
    }


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



}
