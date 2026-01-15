import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime, Info } from 'luxon';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit {
  public viewDate: DateTime = DateTime.now();
  public days: DateTime[] = [];
  public weekDays: string[] = [];

  ngOnInit(): void {
    this.weekDays = Info.weekdays('short', { locale: 'en' });
    this.setupCalendar();
  }

  private setupCalendar(): void {
    const startOfMonth = this.viewDate.startOf('month');
    
    // Always start from the beginning of the week containing the 1st
    let day = startOfMonth.startOf('week');

    this.days = [];
    
    // Loop exactly 42 times to fill 6 rows (6 weeks * 7 days)
    // This makes every month look identical in structure
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