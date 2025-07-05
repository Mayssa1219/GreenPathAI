import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true
})
export class NavbarComponent implements OnInit {
  collapsed = true;
  isDarkTheme = false;

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');

  }

  applyTheme(): void {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  ngOnInit(): void {
    const storedTheme = localStorage.getItem('theme');
    this.isDarkTheme = storedTheme === 'dark';
    this.applyTheme();
    if (storedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    } else {
      this.isDarkTheme = false;
      document.body.classList.remove('dark-theme');
    }
  }
}
