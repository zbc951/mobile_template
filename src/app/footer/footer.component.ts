import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppRoutes } from '../constant/routes';
import { HeaderService } from './../app-service/header.service';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  // styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  AppRoutes = AppRoutes;
  // HeaderService = HeaderService;
  curRoute = '';
  constructor(
    private router: Router,
    public HeaderService: HeaderService,

  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // console.log(event.url.split('/')[1]);
        this.curRoute = event.url.split('/')[1];
      }
    });
  }

  ngOnInit(): void {
  }

}
