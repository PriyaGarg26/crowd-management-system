import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule, MatInput],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm!:FormGroup
  loading:boolean=false;
  serverError:string|null=null;
  showPassword:boolean=false;
constructor(
  private fb:FormBuilder,
  private router:Router,
  private auth:AuthService
){
  this.loginForm=this.fb.group({
    email:['',[Validators.required,Validators.email]],
    password:['',[Validators.required,Validators.minLength(8)]],
    remember:[false]
  })
}
login(){
  if(this.loginForm.invalid){
    this.loginForm.markAllAsTouched();
    return;
  }
  this.serverError=null;
  this.loading=true;
  const {email,password,remember}=this.loginForm.value
  this.auth.login({email,password}).subscribe({
    next:(res:any)=>{
      this.loading=false;
      this.router.navigate(['/dashboard'])
    },
    error:(err)=>{
      this.loading=false;
      if(err?.error?.message){
        this.serverError=err.error.message
      }else if(err?.message){
        this.serverError=err.message
      }else{
        this.serverError='Login failed.Please try again'
      }
    }
  })

}
submit(){
  console.log("login clicked")
}
togglePasswordVisibility(){
  this.showPassword=!this.showPassword
}
get f(){
  return this.loginForm.controls
}
}
