import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppRoutes } from '../constant/routes';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './../app-service/auth.service';
import { MemberService } from './../app-service/member.service';
interface rank {
  autoWater: number;
  autoWaterAt;
  bankLimit: number;
  // clubId;
  createdAt;
  depositDayTimes: number;
  depositPerMax: string;
  depositPerMin: string;
  // enabled;
  // franchiseeId;
  fullpay;
  id: number;
  name: string;
  // order;
  // updatedAt;
  upgradeByDeposit: string;
  upgradeByTotalBetAmount: string;
  upgradeByWithdraw: string;
  withdrawDayTimes: number;
  withdrawFee;
  withdrawFeePeriod: string;
  withdrawFeeType: string;
  withdrawFreeTimes: number;
  withdrawPerMax: string;
  withdrawPerMin: string;
}

@Component({
  selector: 'app-vip',
  templateUrl: './vip.component.html',
  // styleUrls: ['./vip.component.scss']
})
export class VipComponent implements OnInit {

  touchStart = 0;
  touchEnd = 0;
  partners;
  curPage = 0;
  // partnersList;
  partnersWidth;
  partnersImgnum;
  partnersX = 0;
  AppRoutes = AppRoutes;
  @ViewChild('partnersList') partnersList: ElementRef;
  @ViewChild('list') list: ElementRef;
  levels = [];

  // fake
  curLevel = 1;

  showItems = [
    {
      level: 0,
      name: '尊龍',
      deposit: 1000,
      water: 5000,
      three: 10000,
    },
    {
      level: 1,
      name: '尊爵',
      deposit: 1000,
      water: 5000,
      three: 10000
    },
    {
      level: 2,
      name: '黃金',
      deposit: 1000,
      water: 5000,
      three: 10000
    },
    {
      level: 3,
      name: '白金',
      deposit: 1000,
      water: 5000,
      three: 10000
    },
    {
      level: 4,
      name: '鑽石',
      deposit: 1000,
      water: 5000,
      three: 10000
    },
    {
      level: 5,
      name: '翡翠',
      deposit: 1000,
      water: 5000,
      three: 10000
    },
  ];


  rankList = [];
  mine: rank;
  mine2: {
    total_bet?,
    total_deposit?,
    total_withdraw?
  };

  mineIdx = 0;
  next: rank;
  nextLvName = '';


  constructor(
    private router: Router,
    private translateService: TranslateService,
    private memberService: MemberService,
    private auth: AuthService
  ) {
    for (let i = 0; i <= 5; i++) {
      this.translateService.get(`VIP.DETAIL.LEVEL.${i}`)
        .subscribe((trans) => {
          this.levels.push(trans)
        });
    }
  }

  ngOnInit(): void {
    const user = this.auth.user;
    console.log('user', user);

    this.memberService.getClubRankList()
      .subscribe((res) => {

        console.log('getClubRankList', res);
        this.rankList = res;

        const idx = this.rankList.findIndex((item) => {

          return user.clubRankId === item.id;

        });

        this.mineIdx = idx;
        this.mine = this.rankList[idx];


        this.next = (idx !== this.rankList.length - 1) ? this.rankList[idx + 1] : this.next;
        // this.nextLvName = (idx !== this.rankList.length - 1) ? this.rankList[idx + 1].name : '';

        console.log('mine', this.mine);
        // for (let i = 0; i <= this.rankList.length; i++) {
        //   if (i <= this.mineIdx) {
        //     this.levelBar.push(true);
        //   } else {
        //     this.levelBar.push(false);
        //   }
        // }

      });


    this.memberService.getMemberClubRank()
      .subscribe((res) => {

        console.log('getMemberClubRank', res);
        this.mine2 = res;

      });


    this.memberService.getMemberBetAmountByPlatform()
      .subscribe((res) => {

        console.log('getMemberBetAmountByPlatform', res);

      });

  }

  touchS(event) {
    this.touchEnd = 0;
    this.touchStart = 0;

    this.touchStart = event.changedTouches[0].screenX;
  }

  touchE(event) {
    this.partnersImgnum = this.showItems.length;
    this.partnersWidth = this.partnersImgnum * this.list.nativeElement.offsetWidth;
    this.touchEnd = event.changedTouches[0].screenX;
    if ((this.touchStart - this.touchEnd) > 0) {
      this.partnerR();
    }
    if ((this.touchStart - this.touchEnd) < 0) {
      this.partnerL();
    }
    if ((this.touchStart - this.touchEnd) == 0) {
      return;
    }
  }

  partnerR(levelChange = false): void {
    if ((this.partnersX >= -this.partnersWidth + (2 * this.list.nativeElement.offsetWidth) || levelChange)) {
      console.log('ss');
      this.curPage++;
      this.partnersX = this.partnersX - this.list.nativeElement.offsetWidth;
      this.partnersList.nativeElement.style.transform = `translate3d( ${this.partnersX}px, 0px, 0px)`;
    }
  }

  partnerL(): void {
    if (this.partnersX != 0) {
      this.curPage--;
      this.partnersX = this.partnersX + this.list.nativeElement.offsetWidth;
      this.partnersList.nativeElement.style.transform = `translate3d( ${this.partnersX}px, 0px, 0px)`;
    }
  }

  openDetail() {
    this.router.navigate([{ outlets: { popup: [AppRoutes.VIPPOPUP] } }]);
  }

  levelChange(num, event) {
    let distance = num - this.curPage;
    console.log('ss', distance, num, this.curPage);
    if (distance > 0) {
      for (let i = 0; i < distance; i++) {
        console.log('rr')
        this.partnerR(true);
      }
    }

    if (distance < 0) {
      for (let i = 0; i < -distance; i++) {
        console.log('ll')
        this.partnerL();
      }
    }

    if (distance === 0) {
      return;
    }

  }

}
