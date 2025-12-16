import { HttpClient, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { delay, Observable ,of,tap,throwError} from "rxjs";

@Injectable({providedIn:'root'})
export class AuthService{
    constructor(private router: Router,private http:HttpClient) {}
    private readonly MOCK_USER={
        username:'test@mail.com',
        password:'12365478'
    }
    private readonly TOKEN_KEY='auth_token';
    private readonly USER_KEY='auth_user';
    login(payload: { email: string; password: string }) {
  return this.http.post<any>('/api/auth/login', payload).pipe(
    tap(res => {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    })
  );
}
    isLoggedIn():boolean{
        return !! localStorage.getItem(this.TOKEN_KEY)
    }
    getToken():string|null{
        return localStorage.getItem(this.TOKEN_KEY)
    }
    getUser():any|null{
        const u= localStorage.getItem(this.USER_KEY)
        return u?JSON.parse(u):null

    }
    logout(){
        localStorage.removeItem(this.TOKEN_KEY)
        localStorage.removeItem(this.USER_KEY)
        sessionStorage.clear();

   
    this.router.navigate(['/login'], { replaceUrl: true });
    }
}
