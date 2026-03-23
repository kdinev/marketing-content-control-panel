import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IgxNavigationDrawerComponent,
  IgxNavDrawerItemDirective,
  IgxNavDrawerTemplateDirective,
} from '@infragistics/igniteui-angular/navigation-drawer';
import { IgxIconComponent } from '@infragistics/igniteui-angular/icon';
import { IgxRippleDirective, IgxButtonDirective, IgxIconButtonDirective } from '@infragistics/igniteui-angular/directives';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    IgxNavigationDrawerComponent,
    IgxNavDrawerItemDirective,
    IgxNavDrawerTemplateDirective,
    IgxIconComponent,
    IgxRippleDirective,
    IgxButtonDirective,
    IgxIconButtonDirective
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  readonly drawerOpen = signal(true);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isActive(path: string): boolean {
    return this.currentUrl().startsWith(path);
  }

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  navigateToCreate(): void {
    this.router.navigate(['/create']);
  }
}

