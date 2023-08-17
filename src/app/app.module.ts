import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import * as he from 'date-fns/locale/he';
import { registerLocaleData } from '@angular/common';
import localeHe from '@angular/common/locales/he';
import { IonicModule } from '@ionic/angular'; 
import { HttpClientModule } from '@angular/common/http'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

registerLocaleData(localeHe);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),    
    IonicModule.forRoot(),
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase), 
    AngularFireAuthModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'he-IL' }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
