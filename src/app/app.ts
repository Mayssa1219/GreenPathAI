import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoaderService} from './Services/LoadService';
import {CommonModule, NgIf} from '@angular/common';
import {LoadingComponent} from './loading/loading';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule, NgIf, LoadingComponent,BrowserAnimationsModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'GreenPath';
  constructor(public loaderService: LoaderService) {}

}
