import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { EditCourseModalComponent } from './edit-course-modal/edit-course-modal.component';
import { Course, APIFetchedCourse } from './edit-course-modal/course.model';

@Component({
  selector: 'app-course-managment',
  templateUrl: './course-managment.page.html',
  styleUrls: ['./course-managment.page.scss'],
})
export class CourseManagmentPage implements OnInit {
  courses: APIFetchedCourse[] = [];
  consolidatedCourses: Course[] = [];
  private readonly apiEndpoint = 'http://localhost:3000/api/courses';

  constructor(
    private router: Router,
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchAndConsolidateCourses();
  }

  fetchAndConsolidateCourses() {
    this.http.get<APIFetchedCourse[]>(this.apiEndpoint).subscribe(
      (results) => {
        const courseMap = new Map<string, Course>();

        results.forEach((course) => {
          if (courseMap.has(course.courseType)) {
            const existingCourse = courseMap.get(course.courseType);
            
            if (existingCourse && !existingCourse.childIDs.includes(course.childID)) {
              existingCourse.childIDs.push(course.childID);
            }

            const existingSchedule = existingCourse?.schedule.find(
              s => s.dayOfWeek === course.dayOfWeek
            );

            if (!existingSchedule && course.dayOfWeek && (course.startTime || course.endTime)) {
              existingCourse?.schedule.push({
                dayOfWeek: course.dayOfWeek,
                startTime: course.startTime || '',
                endTime: course.endTime || '',
              });
            }

          } else {
            const newCourse: Course = {
              courseType: course.courseType,
              id: course.id,
              teachers: course.teachers,
              childIDs: [course.childID],
              schedule: [],
            };

            if (course.dayOfWeek && (course.startTime || course.endTime)) {
              newCourse.schedule.push({
                dayOfWeek: course.dayOfWeek,
                startTime: course.startTime || '',
                endTime: course.endTime || '',
              });
            }

            courseMap.set(course.courseType, newCourse);
          }
        });

        this.consolidatedCourses = Array.from(courseMap.values());
      },
      (error) => {
        console.error('Error fetching courses:', error);
      }
    );
  }

  goBack() {
    this.router.navigateByUrl('/manager');
  }

  async openModal(course: Course) {
    const modal = await this.modalController.create({
      component: EditCourseModalComponent,
      componentProps: { course: { ...course } },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.updateCourse(result.data);
        this.fetchAndConsolidateCourses(); // Refresh the courses after editing
      }
    });

    return await modal.present();
  }

  updateCourse(updatedCourse: Course) {
    // Code to update the course in your client and server
    // You might call an API endpoint here to update the course in the database
  }
}
