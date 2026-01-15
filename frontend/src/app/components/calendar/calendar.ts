import { CommonModule } from '@angular/common';
import { DateTime, Info } from 'luxon';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit, OnChanges {

  @Input() events: any[] = [];

  public viewDate: DateTime = DateTime.now();
  public days: DateTime[] = [];
  public weekDays: string[] = [];

  ngOnInit(): void {
    this.weekDays = Info.weekdays('short', { locale: 'en' });
    this.setupCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.days = [...this.days];
    }
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

  public hasEventOnDate(date: DateTime): boolean {
  return this.events.some(event => {
    if (!event.dateTime) return false;

    const eventDate = DateTime.fromISO(event.dateTime).startOf('day');
    return eventDate.equals(date.startOf('day'));
  });
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