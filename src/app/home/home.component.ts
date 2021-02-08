import { combineLatest } from 'rxjs';
import { LangService } from './../app-service/lang.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoutes } from '../constant/routes';
import { PublicService, GameTypeKey } from './../app-service/public.service';
import { AuthService } from './../app-service/auth.service';
import { GameService } from './../app-service/game.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  // styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  curType = GameTypeKey.Sport;
  types = [];
  showItems = [];

  constructor(
    private router: Router,
    private publicService: PublicService,
    private auth: AuthService,
    private gameService: GameService,
    private langService: LangService
  ) {

  }

  ngOnInit(): void {

    combineLatest([
      this.langService.onloadSub,
      this.publicService.getTypeMenu(),
      this.publicService.getPlatforms()
    ])
      .subscribe((res: any[]) => {

        if (res[0] === true && res[1].length > 0 && res[2].platforms) {

          const HEADER_NAV = this.langService.translations.HEADER_NAV;

          res[1].forEach((item) => {

            const tname = HEADER_NAV[item.type];

            if (tname) {
              item.name = tname;
            }

          });

          this.types = res[1];
          this.typeChange(this.curType);

        }
      });

  }

  typeChange(type): void {
    this.curType = type;
    this.showItems = this.publicService.getShowItems(this.curType);

  }


  click(item): void {
    // console.log('click', item);

    if (this.curType === GameTypeKey.Slot) {

      this.gameService.slotPlatform = item;
      this.router.navigateByUrl(AppRoutes.SlotCenter);

      return;

    }

    this.gameService.clickGame(item, this.curType);

  }

}
