import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective, IgxCardActionsComponent, IgxCardHeaderTitleDirective, IgxCardHeaderSubtitleDirective } from '@infragistics/igniteui-angular/card';
import { IgxIconComponent } from '@infragistics/igniteui-angular/icon';
import { IgxButtonDirective, IgxRippleDirective } from '@infragistics/igniteui-angular/directives';
import { IGX_LIST_DIRECTIVES } from '@infragistics/igniteui-angular/list';
import { IgxChipComponent } from '@infragistics/igniteui-angular/chips';
import { ContentService } from '../../services/content.service';
import {
  ProductArea,
  PRODUCT_AREA_LABELS,
  PRODUCT_AREA_ICONS,
  MEDIUM_LABELS,
  ContentItem,
  ContentStatus,
  ContentMedium,
} from '../../models/content.model';
import { IgcDockManagerLayout, IgcDockManagerPaneType, IgcSplitPaneOrientation } from '@infragistics/igniteui-dockmanager';

const LAYOUT_STORAGE_KEY = 'dashboard-dock-layout';

@Component({
  selector: 'app-dashboard',
  imports: [
    IgxCardComponent,
    IgxCardHeaderComponent,
    IgxCardContentDirective,
    IgxCardActionsComponent,
    IgxCardHeaderTitleDirective,
    IgxCardHeaderSubtitleDirective,
    IgxIconComponent,
    IgxButtonDirective,
    IgxRippleDirective,
    IGX_LIST_DIRECTIVES,
    IgxChipComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);

  readonly productAreas: ProductArea[] = ['dev-tools', 'reveal', 'slingshot'];

  readonly areaStats = computed(() =>
    this.productAreas.map((area) => this.contentService.getStatsForArea(area))
  );

  readonly recentContent = computed(() =>
    [...this.contentService.publishedItems()]
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, 5)
  );

  readonly scheduledContent = computed(() => this.contentService.scheduledItems());

  readonly pipelineContent = computed(() => this.contentService.pipelineItems());

  readonly totalPublished = computed(() => this.contentService.publishedItems().length);
  readonly totalScheduled = computed(() => this.contentService.scheduledItems().length);
  readonly totalPipeline = computed(() => this.contentService.pipelineItems().length);
  readonly totalImpressions = computed(() =>
    this.contentService
      .publishedItems()
      .reduce((s, i) => s + (i.analytics?.impressions ?? 0), 0)
  );

  private static readonly DEFAULT_LAYOUT: IgcDockManagerLayout = {
    rootPane: {
      type: IgcDockManagerPaneType.splitPane,
      orientation: IgcSplitPaneOrientation.vertical,
      panes: [
        {
          type: IgcDockManagerPaneType.contentPane,
          contentId: 'kpiRow',
          header: 'KPI Overview',
          allowClose: false,
          size: 130,
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.horizontal,
          panes: [
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: 'productAreas',
              header: 'Product Areas',
              allowClose: false,
            },
            {
              type: IgcDockManagerPaneType.splitPane,
              orientation: IgcSplitPaneOrientation.vertical,
              size: 300,
              panes: [
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'scheduled',
                  header: 'Scheduled',
                  allowClose: false,
                },
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'pipeline',
                  header: 'In Pipeline',
                  allowClose: false,
                },
              ],
            },
          ],
        },
        {
          type: IgcDockManagerPaneType.contentPane,
          contentId: 'recentPublished',
          header: 'Recent Published Content',
          allowClose: false,
          size: 260,
        },
      ],
    },
    floatingPanes: [],
  };

  readonly layout = signal<IgcDockManagerLayout>(DashboardComponent.loadSavedLayout());

  private static loadSavedLayout(): IgcDockManagerLayout {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as IgcDockManagerLayout;
    } catch {
      // ignore parse errors, fall through to default
    }
    return structuredClone(DashboardComponent.DEFAULT_LAYOUT);
  }

  onLayoutChange(event: Event): void {
    const el = event.target as HTMLElement & { layout: IgcDockManagerLayout };
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(el.layout));
  }

  resetLayout(): void {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    this.layout.set(structuredClone(DashboardComponent.DEFAULT_LAYOUT));
  }

  getAreaLabel(area: ProductArea): string {
    return PRODUCT_AREA_LABELS[area];
  }

  getAreaIcon(area: ProductArea): string {
    return PRODUCT_AREA_ICONS[area];
  }

  getMediumLabel(medium: ContentMedium): string {
    return MEDIUM_LABELS[medium];
  }

  formatImpressions(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  navigateToArea(area: ProductArea): void {
    this.router.navigate(['/product', area]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/create']);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getStatusClass(status: ContentStatus): string {
    return status;
  }

  getStatusLabel(status: ContentStatus): string {
    const labels: Record<ContentStatus, string> = {
      published: 'Published',
      scheduled: 'Scheduled',
      pipeline: 'In Pipeline',
      draft: 'Draft',
    };
    return labels[status];
  }
}
