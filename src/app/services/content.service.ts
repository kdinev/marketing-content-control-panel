import { Injectable, signal, computed } from '@angular/core';
import {
  ContentItem,
  ContentStatus,
  ProductArea,
  ProductAreaStats,
  ContentMedium,
  LlmModel,
} from '../models/content.model';

const MOCK_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: 'Getting Started with IgxGrid: A Complete Guide',
    excerpt:
      'Learn how to set up and configure the Ignite UI for Angular data grid component for enterprise applications.',
    body: 'Full body content here...',
    productArea: 'dev-tools',
    mediums: ['blog', 'linkedin'],
    status: 'published',
    model: 'gpt-5o',
    tags: ['angular', 'grid', 'tutorial'],
    createdAt: '2026-02-01T10:00:00Z',
    publishedAt: '2026-02-03T09:00:00Z',
    analytics: {
      impressions: 12400,
      reactions: 348,
      shares: 87,
      clicks: 920,
      engagementRate: 2.8,
    },
  },
  {
    id: '2',
    title: 'Building Beautiful Dashboards with Reveal',
    excerpt: 'Discover how Reveal empowers your team to create stunning data visualizations without code.',
    body: 'Full body content here...',
    productArea: 'reveal',
    mediums: ['blog', 'facebook', 'linkedin', 'twitter'],
    status: 'published',
    model: 'claude-4-5-sonnet',
    tags: ['reveal', 'bi', 'dashboard'],
    createdAt: '2026-02-05T11:00:00Z',
    publishedAt: '2026-02-07T09:00:00Z',
    analytics: {
      impressions: 18700,
      reactions: 612,
      shares: 145,
      clicks: 1840,
      engagementRate: 3.3,
    },
  },
  {
    id: '3',
    title: 'Slingshot: Supercharge Your Team Productivity in 2026',
    excerpt: 'How Slingshot helps remote teams stay aligned, hit deadlines, and collaborate effortlessly.',
    body: 'Full body content here...',
    productArea: 'slingshot',
    mediums: ['blog', 'linkedin', 'twitter'],
    status: 'published',
    model: 'gpt-5o',
    tags: ['slingshot', 'productivity', 'remote-work'],
    createdAt: '2026-02-10T09:00:00Z',
    publishedAt: '2026-02-12T09:00:00Z',
    analytics: {
      impressions: 9800,
      reactions: 276,
      shares: 64,
      clicks: 730,
      engagementRate: 2.8,
    },
  },
  {
    id: '4',
    title: 'Top 5 Angular Charts for Financial Data',
    excerpt: 'Explore the best chart types for visualizing financial and time-series data in Angular.',
    body: 'Full body content here...',
    productArea: 'dev-tools',
    mediums: ['blog', 'twitter'],
    status: 'published',
    model: 'gpt-5-turbo',
    tags: ['angular', 'charts', 'finance'],
    createdAt: '2026-02-14T10:00:00Z',
    publishedAt: '2026-02-16T09:00:00Z',
    analytics: {
      impressions: 7600,
      reactions: 198,
      shares: 52,
      clicks: 610,
      engagementRate: 2.6,
    },
  },
  {
    id: '5',
    title: 'Reveal 1.5: New Features Deep Dive',
    excerpt: 'Everything you need to know about the latest Reveal release — new chart types, AI insights, and more.',
    body: 'Full body content here...',
    productArea: 'reveal',
    mediums: ['blog', 'facebook', 'linkedin'],
    status: 'published',
    model: 'claude-4-5-sonnet',
    tags: ['reveal', 'release', 'features'],
    createdAt: '2026-02-18T11:00:00Z',
    publishedAt: '2026-02-20T09:00:00Z',
    analytics: {
      impressions: 22300,
      reactions: 744,
      shares: 198,
      clicks: 2100,
      engagementRate: 3.3,
    },
  },
  {
    id: '6',
    title: 'How Slingshot Integrates with Your Favorite Tools',
    excerpt: 'A look at Slingshot native integrations with Slack, Jira, GitHub, and more.',
    body: 'Full body content here...',
    productArea: 'slingshot',
    mediums: ['blog', 'linkedin', 'facebook'],
    status: 'scheduled',
    model: 'gpt-5o',
    tags: ['slingshot', 'integrations'],
    createdAt: '2026-03-10T10:00:00Z',
    scheduledAt: '2026-03-15T09:00:00Z',
  },
  {
    id: '7',
    title: 'Advanced IgxTreeGrid: Hierarchical Data Made Simple',
    excerpt: 'Master parent-child data rendering with the Ignite UI for Angular Tree Grid.',
    body: 'Full body content here...',
    productArea: 'dev-tools',
    mediums: ['blog', 'forum'],
    status: 'scheduled',
    model: 'gpt-5o',
    tags: ['angular', 'tree-grid', 'advanced'],
    createdAt: '2026-03-08T09:00:00Z',
    scheduledAt: '2026-03-17T09:00:00Z',
  },
  {
    id: '8',
    title: 'Reveal vs Power BI: An Honest Comparison',
    excerpt: 'We break down the differences so you can choose the right BI tool for your team.',
    body: 'Full body content here...',
    productArea: 'reveal',
    mediums: ['blog', 'twitter', 'linkedin'],
    status: 'pipeline',
    model: 'claude-4-5-sonnet',
    tags: ['reveal', 'bi', 'comparison'],
    createdAt: '2026-03-11T11:00:00Z',
  },
  {
    id: '9',
    title: 'Slingshot Goals: Setting and Achieving Quarterly OKRs',
    excerpt: 'How to leverage Slingshot Goals to drive team performance and focus in Q2 2026.',
    body: 'Full body content here...',
    productArea: 'slingshot',
    mediums: ['blog', 'linkedin'],
    status: 'pipeline',
    model: 'gpt-5-turbo',
    tags: ['slingshot', 'okr', 'goals'],
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: '10',
    title: 'Building a Real-Time Stock Dashboard with Ignite UI',
    excerpt: 'Step-by-step guide to creating a live stock ticker dashboard with Angular and Ignite UI charts.',
    body: 'Full body content here...',
    productArea: 'dev-tools',
    mediums: ['blog', 'forum', 'twitter'],
    status: 'draft',
    model: 'gpt-5o',
    tags: ['angular', 'charts', 'real-time'],
    createdAt: '2026-03-13T09:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly _items = signal<ContentItem[]>(MOCK_CONTENT);

  readonly items = this._items.asReadonly();

  readonly publishedItems = computed(() => this._items().filter((i) => i.status === 'published'));

  readonly scheduledItems = computed(() => this._items().filter((i) => i.status === 'scheduled'));

  readonly pipelineItems = computed(() => this._items().filter((i) => i.status === 'pipeline'));

  readonly draftItems = computed(() => this._items().filter((i) => i.status === 'draft'));

  getItemsForArea(area: ProductArea): ContentItem[] {
    return this._items().filter((i) => i.productArea === area);
  }

  getStatsForArea(area: ProductArea): ProductAreaStats {
    const areaItems = this.getItemsForArea(area);
    const published = areaItems.filter((i) => i.status === 'published');
    const scheduled = areaItems.filter((i) => i.status === 'scheduled');
    const pipeline = areaItems.filter((i) => i.status === 'pipeline');

    const totalImpressions = published.reduce((s, i) => s + (i.analytics?.impressions ?? 0), 0);
    const totalReactions = published.reduce((s, i) => s + (i.analytics?.reactions ?? 0), 0);
    const avgEngagement =
      published.length > 0
        ? published.reduce((s, i) => s + (i.analytics?.engagementRate ?? 0), 0) / published.length
        : 0;

    const topContent = [...published].sort(
      (a, b) => (b.analytics?.impressions ?? 0) - (a.analytics?.impressions ?? 0)
    )[0];

    return {
      area,
      totalContent: areaItems.length,
      publishedCount: published.length,
      scheduledCount: scheduled.length,
      pipelineCount: pipeline.length,
      totalImpressions,
      totalReactions,
      avgEngagementRate: Math.round(avgEngagement * 10) / 10,
      topContent,
    };
  }

  getImpressionsOverTime(area: ProductArea): { month: string; impressions: number }[] {
    return [
      { month: 'Sep', impressions: 3200 },
      { month: 'Oct', impressions: 5100 },
      { month: 'Nov', impressions: 4800 },
      { month: 'Dec', impressions: 3600 },
      { month: 'Jan', impressions: 7200 },
      { month: 'Feb', impressions: 9400 },
      { month: 'Mar', impressions: 6800 },
    ];
  }

  getEngagementByMedium(area: ProductArea): { medium: string; reactions: number }[] {
    const mediumMap: Record<string, number> = {};
    this.getItemsForArea(area)
      .filter((i) => i.status === 'published')
      .forEach((item) => {
        item.mediums.forEach((m) => {
          mediumMap[m] = (mediumMap[m] ?? 0) + (item.analytics?.reactions ?? 0);
        });
      });
    return Object.entries(mediumMap).map(([medium, reactions]) => ({ medium, reactions }));
  }

  addContent(item: Omit<ContentItem, 'id' | 'createdAt'>): ContentItem {
    const newItem: ContentItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this._items.update((items) => [...items, newItem]);
    return newItem;
  }

  updateContent(id: string, updates: Partial<ContentItem>): void {
    this._items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }
}
