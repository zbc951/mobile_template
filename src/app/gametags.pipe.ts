import { Pipe, PipeTransform } from '@angular/core';
import { EnumGameTag } from './slot-center/slot-center.component';

@Pipe({
  name: 'gametags'
})
export class GametagsPipe implements PipeTransform {

  transform(list: any[], gameTag, favorites): any {

    if (gameTag === EnumGameTag.all) {

      return list;

    } else if (gameTag === EnumGameTag.fav) {

      return list.filter((item) => {
        return favorites.includes(item.id);
      });

    } else {
      return list.filter((item) => {

        const tmptmp = item.tags.find((tagObj) => {
          return tagObj.tag === gameTag;
        });

        if (tmptmp) {
          return item;
        }

      });

    }
  }

}
