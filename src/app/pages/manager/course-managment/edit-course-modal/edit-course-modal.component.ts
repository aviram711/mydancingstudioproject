
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Course } from './course.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController } from '@ionic/angular';



@Component({
  selector: 'app-edit-course-modal',
  templateUrl: './edit-course-modal.component.html',
})
export class EditCourseModalComponent implements OnChanges {
  @Input() course!: Course;
  newChildID: number | null = null;
  days = [
    { id: 'sun', name: 'ראשון', selected: false },
    { id: 'mon', name: 'שני', selected: false },
    { id: 'tue', name: 'שלישי', selected: false },
    { id: 'wed', name: 'רביעי', selected: false },
    { id: 'thu', name: 'חמישי', selected: false },
    { id: 'fri', name: 'שישי', selected: false },
    { id: 'sat', name: 'שבת', selected: false },
  ];

  startTime: string | null = null;
  endTime: string | null = null;

  ngOnChanges(changes: SimpleChanges) {
    this.startTime = null;
    this.endTime = null;

    if (changes['course'] && changes['course'].currentValue) {
      this.days.forEach(day => {
        const foundSchedule = this.course.schedule ? this.course.schedule.find(s => s.dayOfWeek === day.name) : undefined;
        day.selected = !!foundSchedule;
        if (foundSchedule) {
          this.startTime = foundSchedule.startTime;
          this.endTime = foundSchedule.endTime;
        }
      });
    }
  }

  constructor(private modalController: ModalController, private http: HttpClient, private alertController: AlertController) {}


  saveChanges() {
    const schedulesToSave = this.days.filter(day => day.selected).map(day => ({
      dayOfWeek: day.name,
      startTime: day.selected ? this.startTime : null,
      endTime: day.selected ? this.endTime : null,
    }));

    // POST this data to your backend to save changes
    this.http.post('http://localhost:3000/api/courses/saveChanges', {
      course: this.course,
      schedules: schedulesToSave,
    }).subscribe(
      response => {
        // Handle successful save
        location.reload(); // This will reload the current window
      },
      error => {
        // Handle error
      }
    );
  }

  deleteDay(dayId: string) {
    this.http.delete('http://localhost:3000/api/courses/deleteDay', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        courseId: this.course.id,
        dayOfWeek: dayId
      }
    }).subscribe(
      response => {
        // Handle successful deletion. Update local state and/or notify user.
        const day = this.days.find(d => d.id === dayId);
        if (day) {
          day.selected = false;
        }
      },
      error => {
        // Handle error, notify user about the failure.
      }
    );
  }

  async resetAllDays() {
    const alert = await this.alertController.create({
      header: 'אזהרה',
      message: '?האם אתה בטוח שברצונך לאפס את כל הימים',
      buttons: [
        {
          text: 'לא',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // Do nothing if No is pressed
          }
        }, {
          text: 'כן',
          handler: () => {
            // Reset all days logic here
            this.days.forEach(day => {
              day.selected = false;
            });
            // You can call deleteDay for all days here or create another backend endpoint to reset all days at once.
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  

  cancel() {
    this.modalController.dismiss();
  }

  get selectedDays() {
    return this.days.filter(day => day.selected);
  }
}
