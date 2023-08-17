import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  phoneNumber: string | null = '';
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  constructor(
    private router: Router, 
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.phoneNumber = this.route.snapshot.paramMap.get('phone');
    console.log('Logged in phone number:', this.phoneNumber);
    
    // For demo, adding today's date as a sample event
    this.events.push({
      start: new Date(),
      title: 'Sample Event',
      color: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
      }
    });
  }
  
  goBack() {
    this.router.navigateByUrl('/login');
  }
}
