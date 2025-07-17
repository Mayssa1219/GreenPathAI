import { Component } from '@angular/core';
import {LoaderService} from '../Services/LoadService';
import {CommonModule, NgIf} from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css'
})
export class LoadingComponent {
  constructor(public loaderService: LoaderService) {}


}
