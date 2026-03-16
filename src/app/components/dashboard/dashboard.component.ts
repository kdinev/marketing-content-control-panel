import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective, IgxCardActionsComponent, IgxCardHeaderTitleDirective, IgxCardHeaderSubtitleDirective } from 'igniteui-angular/card';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
import { IGX_LIST_DIRECTIVES } from 'igniteui-angular/list';
import { IgxChipComponent } from 'igniteui-angular/chips';
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
    IgxBadgeComponent,
    IGX_LIST_DIRECTIVES,
    IgxChipComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
