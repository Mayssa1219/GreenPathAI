// dashboard-delay.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import {LoaderService} from '../Services/LoadService';

@Injectable({
  providedIn: 'root'
})
export class DashboardDelayGuard implements CanActivate {

  constructor(private loader: LoaderService) {}

  canActivate(): Promise<boolean> {
    this.loader.show();  // afficher le loader

    return new Promise(resolve => {
      setTimeout(() => {
        this.loader.hide(); // cacher le loader après délai
        resolve(true);      // autoriser la navigation
      }, 2000);             // délai 2 secondes (modifiable)
    });
  }
}
