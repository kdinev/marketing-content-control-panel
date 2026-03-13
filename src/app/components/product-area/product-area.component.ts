import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective, IgxCardHeaderTitleDirective, IgxCardHeaderSubtitleDirective } from 'igniteui-angular/card';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxButtonDirective, IgxRippleDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IGX_TABS_DIRECTIVES } from 'igniteui-angular/tabs';
import { IGX_LIST_DIRECTIVES } from 'igniteui-angular/list';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { ContentService } from '../../services/content.service';
import {
  ProductArea,
  ContentItem,
  ContentStatus,
  ContentMedium,
  PRODUCT_AREA_LABELS,
  PRODUCT_AREA_ICONS,
  MEDIUM_LABELS,
} from '../../models/content.model';

@Component({
  selector: 'app-product-area',
  imports: [
    NgTemplateOutlet,
    IgxCardComponent,
    IgxCardHeaderComponent,
    IgxCardContentDirective,
    IgxCardHeaderTitleDirective,
    IgxCardHeaderSubtitleDirective,
    IgxIconComponent,
    IgxButtonDirective,
    IgxIconButtonDirective,
    IgxRippleDirective,
    IGX_TABS_DIRECTIVES,
    IGX_LIST_DIRECTIVES,
    IgxCategoryChartModule,
  ],
  templateUrl: './product-area.component.html',
  styleUrl: './product-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAreaComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);

  readonly productArea = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('area') as ProductArea)),
    { initialValue: null }
  );

  readonly areaLabel = computed(() => {
    const area = this.productArea();
    return area ? PRODUCT_AREA_LABELS[area] : '';
  });

  readonly areaIcon = computed(() => {
    const area = this.productArea();
    return area ? PRODUCT_AREA_ICONS[area] : 'code';
  });

  readonly stats = computed(() => {
    const area = this.productArea();
    return area ? this.contentService.getStatsForArea(area) : null;
  });

  readonly allContent = computed(() => {
    const area = this.productArea();
    return area ? this.contentService.getItemsForArea(area) : [];
  });

  readonly publishedContent = computed(() =>
    this.allContent().filter((i) => i.status === 'published')
      .sort((a, b) => (b.analytics?.impressions ?? 0) - (a.analytics?.impressions ?? 0))
  );

  readonly scheduledContent = computed(() =>
    this.allContent().filter((i) => i.status === 'scheduled')
  );

  readonly pipelineContent = computed(() =>
    this.allContent().filter((i) => i.status === 'pipeline' || i.status === 'draft')
  );

  readonly impressionsOverTime = computed(() => {
    const area = this.productArea();
    return area ? this.contentService.getImpressionsOverTime(area) : [];
  });

  readonly engagementByMedium = computed(() => {
    const area = this.productArea();
    return area ? this.contentService.getEngagementByMedium(area) : [];
  });

  readonly topContentRanking = computed(() =>
    [...this.publishedContent()].slice(0, 5)
  );

  getMediumLabel(medium: ContentMedium): string {
    return MEDIUM_LABELS[medium];
  }

  formatImpressions(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
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

  navigateToCreate(): void {
    this.router.navigate(['/create'], {
      queryParams: { area: this.productArea() },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
