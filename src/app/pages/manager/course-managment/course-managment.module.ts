import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';
import { CourseManagmentPageRoutingModule } from './course-managment-routing.module';
import { CourseManagmentPage } from './course-managment.page';
import { EditCourseModalComponent } from './edit-course-modal/edit-course-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    IonicModule,
    CourseManagmentPageRoutingModule,
  ],
  declarations: [
    CourseManagmentPage,
    EditCourseModalComponent,
  ],
})
export class CourseManagmentPageModule {}
