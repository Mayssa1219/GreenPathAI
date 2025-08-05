import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './Interceptor/AuthInterceptor';
import {provideAnimations} from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {ToastrModule} from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideCharts(withDefaultRegisterables())
  ]
};
