import { Component, OnInit } from '@angular/core';

enum tabs {
  apply,
  recored
}

@Component({
  selector: 'app-old-quest-center',
  templateUrl: './old-quest-center.component.html',
  // styleUrls: ['./old-quest-center.component.scss']
})
export class OldQuestCenterComponent implements OnInit {

  tabs = tabs;
  tab = tabs.apply;

  constructor() { }

  ngOnInit(): void {
  }

  selectType(t): void {

    this.tab = t;

  }

}
