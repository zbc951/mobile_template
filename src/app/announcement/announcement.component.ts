import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicService, MarqueeType } from '../app-service/public.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  // styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent implements OnInit {

  // marquees: Observable<string>;
  marquees = [];
  showCnt;
  total = 0;
  count = 0;


  constructor(
    private publicService: PublicService
  ) { }

  ngOnInit(): void {

    this.publicService.updateMarquee();

    this.publicService.getMarguee()
      .subscribe((src) => {

        this.marquees = src.filter(m => m.type === MarqueeType.Hot);
        this.total = this.marquees.length;
        this.showCnt = this.marquees[0];
      });
  }

  next(): void {
    this.count++;

    if (this.count === this.total) {
      this.count = 0;
    }
    this.showCnt = this.marquees[this.count];
  }

}
