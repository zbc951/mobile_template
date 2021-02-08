import { Router } from '@angular/router';
import { AppRoutes } from './../constant/routes';
import { Component, OnInit } from '@angular/core';

enum Tabs {
  // DEPOSIT,
  // BONUS,
  WALLET,
  TRANSFER,
  // AmountRecord
}

@Component({
  selector: 'app-review-main',
  templateUrl: './review-main.component.html',
  // styleUrls: ['./review-main.component.scss']
})
export class ReviewMainComponent implements OnInit {

  AppRoutes = AppRoutes;
  tabs: any = Tabs;
  selected: Tabs;
  path;

  constructor(
    private route: Router
  ) { }

  ngOnInit(): void {

    this.path = this.route.url.split('/')[1];
    console.log('path', this.path);

    switch (this.path) {

      case AppRoutes.REVIEW_ACTIVITY:
        this.selected = Tabs.WALLET
        break;

      case AppRoutes.REVIEW_MAIN:
        this.selected = Tabs.TRANSFER;
        break;

    }
    // this.selected = Tabs.TRANSFER;
    // this.selected = Tabs.AmountRecord;
  }

  // selectType(t: Tabs): void {
  //   this.selected = t;
  // }
}
