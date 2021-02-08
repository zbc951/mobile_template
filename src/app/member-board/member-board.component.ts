import { PublicService } from './../app-service/public.service';
import { AuthService } from './../app-service/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppRoutes } from '../constant/routes';
@Component({
  selector: 'app-member-board',
  templateUrl: './member-board.component.html',
  // styleUrls: ['./member-board.component.scss']
})
export class MemberBoardComponent implements OnInit {

  AppRoutes = AppRoutes;

  isMaintain = false;
  isLogin = false;

  user;
  lv;


  constructor(
    private router: Router,
    private auth: AuthService,
    private publicService: PublicService

  ) {

    this.publicService.isMaintainSub
      .subscribe((res) => {

        this.isMaintain = res;
        // console.log('isMaintain', this.isMaintain);

      });

  }

  ngOnInit(): void {
    this.auth.isLogin()
      .subscribe((isLogin) => {

        this.isLogin = isLogin;
        const { user } = this.auth;
        this.user = user;

        if (user) {
          this.lv = user.clubRank.split(')')[1].trim();
        }

      });
  }

  login(): void {

    if (this.isMaintain) {

      return;

    }

    this.router.navigate([{ outlets: { popup: [AppRoutes.LOGIN] } }]);

  }
}
