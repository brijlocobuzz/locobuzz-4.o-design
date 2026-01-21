import { Injectable, NgZone } from '@angular/core';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class SlasettingService {
  constructor(private _ngZone: NgZone) {}

  GetSLASetting(
    currentBrand: BrandList,
    ticketHistoryData: AllBrandsTicketsDTO,
    user: AuthUser,
    mention: BaseMention
  ): any {
    ticketHistoryData.SLACounterStartInSecond =
      currentBrand.slaCounterStartInSecond;
    ticketHistoryData.typeOfShowTimeInSecond =
      currentBrand.typeOfShowTimeInSecond;
    if (currentBrand.isEnableShowTimeInSecond) {
      ticketHistoryData.iSEnableShowTimeInSecond = 1;
    } else {
      ticketHistoryData.iSEnableShowTimeInSecond = 0;
    }
    if (
      +user.data.user.role === UserRoleEnum.Agent ||
      +user.data.user.role === UserRoleEnum.SupervisorAgent ||
      +user.data.user.role === UserRoleEnum.LocationManager ||
      +user.data.user.role === UserRoleEnum.TeamLead
    ) {
      if (
        mention.ticketInfo.status === TicketStatus.Open ||
        mention.ticketInfo.status === TicketStatus.PendingwithAgent ||
        mention.ticketInfo.status === TicketStatus.CustomerInfoAwaited ||
        mention.ticketInfo.status === TicketStatus.PendingWithBrand ||
        mention.ticketInfo.status === TicketStatus.PendingwithCSD ||
        mention.ticketInfo.status ===
          TicketStatus.RejectedByBrandWithNewMention ||
        mention.ticketInfo.status === TicketStatus.RejectedByBrand ||
        mention.ticketInfo.status === TicketStatus.ApprovedByBrand ||
        mention.ticketInfo.status ===
          TicketStatus.PendingwithCSDWithNewMention ||
        mention.ticketInfo.status === TicketStatus.OnHoldAgent ||
        mention.ticketInfo.status === TicketStatus.OnHoldBrand ||
        mention.ticketInfo.status === TicketStatus.OnHoldCSD
      ) {
        if (
          mention.ticketInfo.flrtatSeconds == null ||
          mention.ticketInfo.flrtatSeconds <= 0
        ) {
          if (mention.ticketInfo.tattime > 0) {
            ticketHistoryData.isbreached = true;
          } else if (mention.ticketInfo.tattime <= 0) {
            /*&& item.TATTIME >= -SLAMinutes*/
            ticketHistoryData.isabouttobreach = true;

            this._ngZone.runOutsideAngular(() => {
              setInterval(() => {
                ticketHistoryData = this.abouttobreachtimeleft(
                  mention,
                  ticketHistoryData
                );
              }, 1000);
            });
          }
        }
      }
    }

    return ticketHistoryData;
  }

  abouttobreachtimeleft(
    mention: BaseMention,
    ticketHistoryData: AllBrandsTicketsDTO
  ): any {
    const utcdate = moment.utc();
    const breachtimeutc = moment.utc(mention.ticketInfo.tatflrBreachTime);
    const h = moment.utc(new Date(null));
    const timeString = breachtimeutc.diff(h, 'seconds');
    const ticketid = mention.ticketInfo.ticketID;
    const slacounterstartinsecond = ticketHistoryData.SLACounterStartInSecond;
    const isenableshowtimeinsecond = ticketHistoryData.iSEnableShowTimeInSecond;
    const typeofshowtimeinsecond = ticketHistoryData.typeOfShowTimeInSecond;
    const currenttime = moment();
    const abouttobreach = moment.utc(+timeString * 1000).local();
    let timetobreach = moment(abouttobreach, 'DD/MM/YYYY').from(
      moment(currenttime, 'DD/MM/YYYY')
    );

    const diffTime = +abouttobreach - +currenttime;
    let duration = moment.duration(diffTime, 'milliseconds');
    const interval = 1000;

    const timeminandsec = +slacounterstartinsecond / 60;
    let mincounter = Math.round(timeminandsec);

    if (mincounter === 0) {
      mincounter = 3;
    }

    duration = moment.duration(+duration - +interval, 'milliseconds');

    if (isenableshowtimeinsecond === 1) {
      if (typeofshowtimeinsecond === 0) {
        // always show
        if (
          duration.hours() > 0 &&
          duration.minutes() > 0 &&
          duration.seconds() > 0
        ) {
          timetobreach =
            duration.hours() +
            'h ' +
            duration.minutes() +
            'm ' +
            duration.seconds() +
            's';
        } else if (
          duration.hours() <= 0 &&
          duration.minutes() > 0 &&
          duration.seconds() > 0
        ) {
          timetobreach = duration.minutes() + 'm ' + duration.seconds() + 's';
        } else if (
          duration.hours() <= 0 &&
          duration.minutes() <= 0 &&
          duration.seconds() > 0
        ) {
          timetobreach = duration.seconds() + 's';
        } else if (
          duration.hours() < 0 &&
          duration.minutes() < 0 &&
          duration.seconds() < 0
        ) {
          timetobreach =
            -duration.hours() +
            'h ' +
            -duration.minutes() +
            'm ' +
            -duration.seconds() +
            's ago';
        } else if (
          duration.hours() === 0 &&
          duration.minutes() < 0 &&
          duration.seconds() < 0
        ) {
          timetobreach =
            -duration.minutes() + 'm' + -duration.seconds() + 's ago';
        } else if (
          duration.hours() === 0 &&
          duration.minutes() === 0 &&
          duration.seconds() < 0
        ) {
          timetobreach = -duration.seconds() + 's ago';
        }
      } else {
        // below min counter
        if (
          duration.hours() === 0 &&
          duration.minutes() < mincounter &&
          duration.seconds() > 0
        ) {
          if (
            duration.hours() > 0 &&
            duration.minutes() > 0 &&
            duration.seconds() > 0
          ) {
            timetobreach =
              duration.hours() +
              'h ' +
              duration.minutes() +
              'm ' +
              duration.seconds() +
              's';
          } else if (
            duration.hours() <= 0 &&
            duration.minutes() > 0 &&
            duration.seconds() > 0
          ) {
            timetobreach = duration.minutes() + 'm ' + duration.seconds() + 's';
          } else if (
            duration.hours() <= 0 &&
            duration.minutes() <= 0 &&
            duration.seconds() > 0
          ) {
            timetobreach = duration.seconds() + 's';
          } else if (
            duration.hours() < 0 &&
            duration.minutes() < 0 &&
            duration.seconds() < 0
          ) {
            timetobreach =
              -duration.hours() +
              'h ' +
              -duration.minutes() +
              'm ' +
              -duration.seconds() +
              's ago';
          } else if (
            duration.hours() === 0 &&
            duration.minutes() < 0 &&
            duration.seconds() < 0
          ) {
            timetobreach =
              -duration.minutes() + 'm ' + -duration.seconds() + 's ago';
          } else if (
            duration.hours() === 0 &&
            duration.minutes() === 0 &&
            duration.seconds() < 0
          ) {
            timetobreach = -duration.seconds() + 's ago';
          }
        }
      }
    }
    ticketHistoryData.timetobreach = timetobreach;

    if (timetobreach.indexOf('ago') > -1) {
      ticketHistoryData.alreadybreached = true;
    }

    return ticketHistoryData;
  }
}

