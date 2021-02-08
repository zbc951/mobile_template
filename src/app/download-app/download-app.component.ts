import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-download-app',
  templateUrl: './download-app.component.html',
  // styleUrls: ['./download-app.component.scss']
})
export class DownloadAppComponent implements OnInit {
  public demo: any = [];

  constructor() {
    for (let i = 0; i < 40; i++) {
      this.demo.push(i);
    }
  }

  ngOnInit(): void {}
}
