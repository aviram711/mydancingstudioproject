import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagerPage } from './manager.page';

const routes: Routes = [
  {
    path: '',
    component: ManagerPage
  },
  {
    path: 'customer-managment',
    loadChildren: () => import('./customer-managment/customer-managment.module').then( m => m.CustomerManagmentPageModule)
  },
  {
    path: 'course-managment',
    loadChildren: () => import('./course-managment/course-managment.module').then( m => m.CourseManagmentPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerPageRoutingModule {}
