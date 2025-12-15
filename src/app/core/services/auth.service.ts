import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { delay, Observable ,of,tap,throwError} from "rxjs";

@Injectable({providedIn:'root'})
export class AuthService{
    constructor(private router: Router) {}
    private readonly MOCK_USER={
        username:'test@mail.com',
        password:'12365478'
    }
    private readonly TOKEN_KEY='auth_token';
    private readonly USER_KEY='auth_user';
    login(payload:{email:string;password:string}):Observable<{token:string;user:any}>{
       const ok=payload && payload.email && payload.password && (payload.email===this.MOCK_USER.username && payload.password===this.MOCK_USER.password)
       if(ok){
        const resp={token:'mock-jwt-token',user:{name:'Demo User',email:payload.email}}
        return of(resp).pipe(delay(500),tap(r=>{localStorage.setItem(this.TOKEN_KEY,r.token);
    localStorage.setItem(this.USER_KEY,JSON.stringify(r.user))}))
       }
       return throwError(()=>({
        status:401,
        message:'Invalid email or password please try again'}))
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
