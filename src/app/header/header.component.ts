import { EventService } from './../app-service/event.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoutes } from '../constant/routes';
import config from 'src/config';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HeaderService, actions } from './../app-service/header.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  // styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  noLogo = config.noLogo.noLogo;

  AppRoutes = AppRoutes;
  actions = actions;
  actionNow = actions.LetterEdit;
  title;

  constructor(
    public headerService: HeaderService,
  ) {

    this.headerService.getTitle()
      .subscribe((res) => {

        this.title = res;

      });

    this.headerService.listenAction()
      .subscribe((action) => {

        // console.log('listenAction', action);

        switch (action) {

          case actions.LetterEdit:
            this.actionNow = actions.LetterDone;
            break;

          case actions.LetterDone:
            this.actionNow = actions.LetterEdit;
            break;
          case actions.LetterDetailShowDelet:
            this.actionNow = actions.LetterDetailShowDelet;
            break;

          case actions.LetterNoneEdit:
            this.actionNow = actions.LetterNoneEdit;
            break;

        }

      });
  }

  ngOnInit(): void {
  }


  letterEdit(): void {
    this.headerService.emitAction(actions.LetterEdit);
  }

  letterEditDone(): void {
    this.headerService.emitAction(actions.LetterDone);
  }

  letterDelet(): void {
    this.headerService.emitAction(actions.LetterDetailDelet);
  }

  refreshMywallet(): void {

    // this.headerService.emitAction(actions.MyWalletRefresh);
    EventService.dispatch(actions.MyWalletRefresh);
  }

}
