import { ToastService } from './../app-service/toast.service';
import { AppRoutes } from './../constant/routes';
import { Router } from '@angular/router';
import { WalletService, buyResponse, Activity_type } from './../app-service/wallet.service';
import { Component, OnInit } from '@angular/core';
import { LangService } from './../app-service/lang.service';
import { AuthService } from './../app-service/auth.service';

@Component({
  selector: 'app-quest-detail',
  templateUrl: './quest-detail.component.html',
  // styleUrls: ['./quest-detail.component.scss']
})
export class QuestDetailComponent implements OnInit {

  Activity_type = Activity_type;

  item;

  constructor(
    private walletService: WalletService,
    private router: Router,
    private toast: ToastService,
    private langService: LangService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.item = this.walletService.tmpActivity;
    // console.log(this.item);

    if (!this.item) {
      this.router.navigateByUrl(AppRoutes.Activity_Wallet);
    }
  }

  buy(item): void {

    if (this.auth.user.money < item.price) {
      this.toast.error(this.langService.translations.QUEST_CENTER.buy_moneyNotEnough);
      return;
    }

    this.walletService.buy(item, this.langService.translations.QUEST_CENTER);

  }

}
