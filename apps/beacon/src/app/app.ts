import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SettingsService } from '@beacon/data-access';
import { Button } from '@beacon/ui';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button],
  selector: 'bc-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('Beacon');
  protected readonly settings = inject(SettingsService);
}
