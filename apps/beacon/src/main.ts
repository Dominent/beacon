import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { reportWebVitals } from './app/web-vitals';

bootstrapApplication(App, appConfig)
  .then(() => reportWebVitals())
  .catch((err) => console.error(err));
