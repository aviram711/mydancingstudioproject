import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  phone: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private http: HttpClient

  ) {}

  ngOnInit() {}

  navigateToRegister() {
    this.router.navigateByUrl('/register');
  }

  forgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

async login() {
  // Check for admin credentials
  if (this.phone.toLowerCase() === 'admin' && this.password === 'Admin') {
    this.router.navigateByUrl('/manager');
    return;
  }

  // Otherwise, attempt to login with the provided phone number and password
  try {
    const response = await this.http.post<any>('http://localhost:3000/api/login', {
      phoneNumber: this.phone,
      password: this.password
    }).toPromise();

    if (response.message === 'Login successful!') {
      this.router.navigate(['/home', this.phone]);
    } else {
      alert('Invalid phone number or password'); // Adjust this as needed (e.g. show a toast notification)
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('An error occurred. Please try again.'); // Adjust this as needed
  }
}

  
}
