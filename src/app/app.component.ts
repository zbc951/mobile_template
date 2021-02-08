import { AppRoutes } from './constant/routes';
import { NavigationStart, Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { Component } from '@angular/core';
import { PublicService } from './app-service/public.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private publicService: PublicService,
    private router: Router
  ) {

    this.router.events
      .subscribe((event) => {


        if (event instanceof NavigationStart) {

          // console.log('router event', this.router, event);

          if (event.url.includes('register') && event.url.includes('code=')) {

            const code = event.url.split('code=')[1];
            // console.log('code', code);

            if (code) {

              localStorage.setItem(AppRoutes.REGISTER, code);
              this.router.navigateByUrl(AppRoutes.HOME)
                .then(() => {
                  this.router.navigateByUrl(AppRoutes.REGISTER);
                });

            }

          }

          if (event instanceof NavigationEnd) {
            this.publicService.scrollToTop();
          }


        }


      });

    this.publicService.init();
    this.publicService.games();
    this.publicService.gameTypes();
    this.publicService.updateCarousel();
    this.publicService.updateMarquee();

    setInterval(() => {
      this.publicService.updateCarousel();
      this.publicService.updateMarquee();
    }, 60000);

  }

}
