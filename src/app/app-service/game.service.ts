import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { AppRoutes } from './../constant/routes';
import { LangService } from './lang.service';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { PublicService, IGame, GameTypeKey } from './public.service';
import { ApiPath } from '../constant/api';
import { WalletService } from './wallet.service';

interface GameWindowItem {
  platformId: number; // platform id
  window: Window;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameWindow: GameWindowItem[] = [];
  transitionData: {
    pkey?,
    game?
  } = {};

  _slotPlatform;


  constructor(
    private walletService: WalletService,
    private publicService: PublicService,
    private auth: AuthService,
    private langService: LangService,
    private toast: ToastService,
    private router: Router
  ) {

    window.onbeforeunload = () => {
      this.closeGame();
    };

  }


  set slotPlatform(pf) {

    this._slotPlatform = pf;
    localStorage.setItem(AppRoutes.SlotCenter, JSON.stringify(pf));
  }

  get slotPlatform(): any {
    const pf = (this._slotPlatform) ? this._slotPlatform : JSON.parse(localStorage.getItem(AppRoutes.SlotCenter));

    return pf;
  }

  launchGame(game: IGame, purchaseLogId, free = false): void {

    console.log('launchGame', game);

    let url;
    if (purchaseLogId) {

      url = `${ApiPath.ApiMemberGameLaunchGame}?id=${game.id}&free=${free}&platformId=${game.platformId}&purchaseLogId=${purchaseLogId}`;
    } else {
      url = `${ApiPath.ApiMemberGameLaunchGame}?id=${game.id}&free=${free}&platformId=${game.platformId}`;
    }


    this.closeGame(game);

    this.gameWindow.push({
      platformId: game.platformId,
      window: window.open(url, '', ''),
    });

  }

  launchGame2(gamedata, free = false): void {

    if (!gamedata.pkey) {

      this.launchGame(gamedata, gamedata.purchaseLogId);
    } else {

      const game = gamedata.game;

      if (!game) {
        console.log('err');
        return;
      }

      const flatforms = this.walletService.multiWalletPlatforms;

      if (!flatforms) {
        return;
      }

      const multiWalletKeys = flatforms.map((p) => {
        return p.id;
      });

      // console.log('multiWalletKeys', multiWalletKeys, game);

      if (multiWalletKeys.includes(game.platformId)) {

        let url;

        if (gamedata.purchaseLogId) {

          url = `${ApiPath.ApiWalletGetwallet}/${gamedata.pkey}/4?gameId=${game.id}&device=mobile&platformId=${game.platformId}&purchaseLogId=${gamedata.purchaseLogId}`;
        } else {

          url = `${ApiPath.ApiWalletGetwallet}/${gamedata.pkey}/4?gameId=${game.id}&device=mobile&platformId=${game.platformId}`;
        }

        this.closeGame(game);
        this.gameWindow.push({
          platformId: game.platformId,
          window: window.open(url, '', ''),
        });

      } else {

        this.launchGame(game, gamedata.purchaseLogId);

      }

    }

  }

  closeGame(game?: IGame): void | boolean {

    if (!game) {

      this.gameWindow.forEach(gw => gw.window.close());
      this.gameWindow = [];

    } else {

      this.gameWindow = this.gameWindow.filter(gw => {
        if (gw.platformId === game.platformId) {
          gw.window.close();
          return false;
        }
        return true;
      });

    }

  }

  clickGame(item, gametype): void {
    // console.log('clickGame', item, 'gametype', gametype);

    const isLogin = this.auth.user;

    if (!isLogin) {
      console.log('not login');
      this.toast.error(this.langService.translations.loginFirst);
      return;
    }

    if (!item) {
      this.toast.error('not exists game');
      return;
    }

    let key;

    switch (gametype) {

      case GameTypeKey.Slot:
      case GameTypeKey.Fishing:
      case GameTypeKey.Board:

        key = this.publicService.getPkey(gametype, item.platformId);
        this.transitionData =
        {
          pkey: key,
          game: item
        };

        this.openTransferWallet();
        break;

      case GameTypeKey.Sport:
      case GameTypeKey.Lottery:
      case GameTypeKey.Live:
        this.transitionData = {
          pkey: item.key,
          game: item.games[0]
        };

        this.openTransferWallet();

        break;

    }

  }

  openTransferWallet(): void {
    // console.log('openTransferWallet');
    this.router.navigate([{ outlets: { popup: [AppRoutes.TRANSPOPUP] } }]);
  }

}
