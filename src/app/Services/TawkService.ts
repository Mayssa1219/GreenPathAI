import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TawkService {
  private isLoaded = false;

  load(): void {
    if (this.isLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/686954c3efc4951919abcb35/1ivdn6775';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);

    this.isLoaded = true;
  }
}
