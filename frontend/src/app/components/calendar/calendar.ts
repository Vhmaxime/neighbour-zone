import { CommonModule } from '@angular/common';
import { DateTime, Info } from 'luxon';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {

   @Input() events: any[] = [];

  public viewDate: DateTime = DateTime.now();
  public days: DateTime[] = [];
  public weekDays: string[] = [];

  ngOnInit(): void {
    this.weekDays = Info.weekdays('short', { locale: 'en' });
    this.setupCalendar();
  }

  private setupCalendar(): void {
    const startOfMonth = this.viewDate.startOf('month');
    
    let day = startOfMonth.startOf('week');

    this.days = [];
    
    for (let i = 0; i < 42; i++) {
      this.days.push(day);
      day = day.plus({ days: 1 });
    }
  }

  public isToday(date: DateTime): boolean {
    return date.hasSame(DateTime.now(), 'day');
  }

  public prevMonth(): void {
    this.viewDate = this.viewDate.minus({ months: 1 });
    this.setupCalendar();
  }

  public nextMonth(): void {
    this.viewDate = this.viewDate.plus({ months: 1 });
    this.setupCalendar();
  }
}