import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})

export class Sidebar {
  constructor(private router:Router,private auth:AuthService){}
  menu = [
    { label: 'Overview', icon: 'dashboard', route: '/dashboard/overview' },
    { label: 'Entries', icon: 'groups', route: '/dashboard/entries' },

  ];
  logout(): void {
    // 1. Remove tokens
    this.auth.logout()
  }
}
