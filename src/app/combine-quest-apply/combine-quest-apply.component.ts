import { ToastService } from './../app-service/toast.service';
import { LangService } from './../app-service/lang.service';
import { QUEST_VERSION } from './../app-service/public.service';
import { MemberService } from './../app-service/member.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-combine-quest-apply',
  templateUrl: './combine-quest-apply.component.html',
  // styleUrls: ['./combine-quest-apply.component.scss']
})
export class CombineQuestApplyComponent implements OnInit {

  QUEST_VERSION = QUEST_VERSION;
  quest_version;
  isNoList = false;
  questList = [];
  translations;


  constructor(
    private memberService: MemberService,
    private langService: LangService,
    private toast: ToastService
  ) {

    this.langService.onloadSub
      .subscribe((boo) => {

        if (boo) {

          this.translations = this.langService.translations;

        }

      });
  }

  ngOnInit(): void {
    this.getQuestList();
  }

  getQuestList(): void {

    this.memberService.getQuestList()
      .subscribe((res) => {
        const questList = res.data.content;
        if (questList.length > 0) {
          this.isNoList = false;
        }

        questList.forEach((item) => {

          item.quest_type_name = this.translations.quest_method[item.method];

          if (item.valid_amount == null) {
            item.valid_amount = 0;
          }

          if (item.stages) {
            let stages = JSON.parse(item.stages);

            stages.forEach((el, index) => {

              el.idx = index;
              el.condition.forEach(element => {
                element.name = this.translations.quest_conditions[element.code];
                element.value = Math.abs(Number(element.value));
              });

              if ((this.quest_version != QUEST_VERSION.COMBINE) && !el.rewardMax) {
                el.rewardMax = el.reward;
              }
            });


            let shift = 0;
            let idx = -1;

            if (item.method == 'before') {

              for (let i = 0; i < stages.length; i++) {

                if (item.review_deposit >= stages[i].amount) {

                  idx = i;

                } else {

                  idx = i - 1;
                  break;
                }

              }

            } else {

              for (let i = 0; i < stages.length; i++) {

                if (item.valid_amount >= stages[i].amount) {

                  idx = i;

                } else {

                  idx = i - 1;
                  break;
                }

              }

            }


            if (stages[idx + 1]) {
              shift = (item.method == 'before') ? (stages[idx + 1].amount - item.review_deposit) : (stages[idx + 1].amount - item.valid_amount);
            }

            // item.reach = idx;
            if (item.stage_index) {

              item.reach = item.stage_index;

            }
            item.shift = shift;


            item.stagesData = stages;
          }

          if (item.conditions) {

            item.conditions = JSON.parse(item.conditions);
            item.conditions.forEach(element => {
              element.name = this.translations.quest_conditions[element.code];
              element.value = Math.abs(Number(element.value));
            });

          }

          if (item.period) {

            item.period = JSON.parse(item.period);
            item.period.name = this.translations.quest_period[item.period.code];
          }


        });

        this.questList = questList;
      });

  }

  applyQuest(item): void {

    this.memberService.applyQuest(item.quest_id, item.detail_id)
      .subscribe(
        (res) => {
          // console.log('res', res);
          item.can_reward = false;
          this.toast.error(this.translations.MEMBER_QUEST.applied_msg, 3000);
        }
        , (err) => {
          // console.log('err', err);
          this.toast.error(err.error.message, 3000);
        });
  }

  openDetail(item): void {

    // console.log('openDetail', item);

    // item.image_url = 'http://3.113.179.224:8084/upload-files/quest/1602057360GrGSy34Qti6ZRgVxqgvMnVo0sUThcAxHTkcpBKr3.jpeg';

    const cnt = `<img src="${item.image_url}">${item.information}`;
    this.toast.questDetail(cnt);

  }

  check(stage): void {

    this.memberService.tmpStageDetail = stage;

    this.toast.questCondition(() => {
      this.memberService.tmpStageDetail = null;
    });

  }
}
