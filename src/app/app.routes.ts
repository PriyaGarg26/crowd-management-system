import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './layout/layout';
import { Overview } from './pages/overview/overview';
import { Entries } from './pages/entries/entries';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'login',component:Login},
    {
        path:'dashboard',
        component:Layout,
        canActivate:[AuthGuard],
        children:[
            {path:'',redirectTo:'overview',pathMatch:'full'},
            {path:'overview',component:Overview},
            {path:'entries',component:Entries},
            {path:'',redirectTo:'overview',pathMatch:'full'}
        ]
    },
    {path:'**',redirectTo:'login'}
];
