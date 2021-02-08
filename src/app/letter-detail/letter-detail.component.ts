import { HeaderService, actions } from './../app-service/header.service';
import { AppRoutes } from './../constant/routes';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LetterService } from './../app-service/letter.service';
@Component({
  selector: 'app-letter-detail',
  templateUrl: './letter-detail.component.html',
  // styleUrls: ['./letter-detail.component.scss']
})
export class LetterDetailComponent implements OnInit {

  data;

  constructor(
    private letterService: LetterService,
    private router: Router,
    private headerService: HeaderService
  ) {

    this.data = this.letterService.tmpMsg;
    // console.log('data', this.data);

    if (!this.data) {

      this.router.navigateByUrl(AppRoutes.LETTER);

    }



    this.headerService.listenAction()
      .subscribe((action) => {

        // console.log('action', action);

        switch (action) {

          case actions.LetterDetailDelet:
            this.removeMessage();
            break;

        }

      });

  }

  ngOnInit(): void {
  }

  removeMessage(): void {

    this.letterService.remove([this.data.id])
      .subscribe(
        (res) => {
          this.router.navigateByUrl(AppRoutes.LETTER);
        }, (err) => {

          console.log(err);
        }
      );
  }

}
