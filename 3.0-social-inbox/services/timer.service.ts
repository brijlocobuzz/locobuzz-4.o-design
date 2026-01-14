import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  constructor(private ngZone:NgZone,
    private router:Router) { }

  timerSubscription = new Subject<boolean>();
  timer:any;

  startTimer():void
  {
    this.ngZone.runOutsideAngular((res)=>{
      this.timer = setInterval(() => {
          this.timerSubscription.next(true);
          
      }, 1000)
  })
  }

  endTimer(): void
  {
    if (this.timer)
    {
      clearInterval(this.timer);
    }
  }
}
