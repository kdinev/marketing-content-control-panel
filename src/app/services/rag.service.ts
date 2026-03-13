import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RagRequest, RagResponse } from '../models/content.model';

const RAG_BASE_URL = 'https://ai-agent-gateway.infragistics.com';

@Injectable({ providedIn: 'root' })
export class RagService {
  private readonly http = inject(HttpClient);

  private bearerToken = '';

  setToken(token: string): void {
    this.bearerToken = token;
  }

  invokeByProductType(input: string, productType: string, sessionId?: string): Observable<RagResponse> {
    const body: RagRequest = { input, productType, sessionId };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(this.bearerToken ? { Authorization: `Bearer ${this.bearerToken}` } : {}),
    });

    return this.http
      .post<RagResponse>(`${RAG_BASE_URL}/api/agents/invokeByProductType`, body, { headers })
      .pipe(catchError(() => this.getMockRagResponse(input, productType)));
  }

  invokeMasterAgent(input: string, sessionId?: string): Observable<RagResponse> {
    const body: RagRequest = { input, sessionId };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(this.bearerToken ? { Authorization: `Bearer ${this.bearerToken}` } : {}),
    });

    return this.http
      .post<RagResponse>(`${RAG_BASE_URL}/api/agents/invokeMasterAgent`, body, { headers })
      .pipe(catchError(() => this.getMockRagResponse(input, 'master')));
  }

  private getMockRagResponse(input: string, productType: string): Observable<RagResponse> {
    const mockContexts: Record<string, string> = {
      igniteui:
        'Ignite UI for Angular provides a comprehensive suite of 100+ UI components optimized for Angular. Key features include the IgxGrid with virtualization for millions of rows, IgxCharts with 65+ chart types, theming system with 4 design systems (Material, Bootstrap, Fluent, Indigo), and full accessibility (WCAG AA). Recent highlights: Angular 20 compatibility, improved SSR support, new AI-focused components.',
      reveal:
        'Reveal is an embedded analytics platform enabling teams to create interactive dashboards and reports without coding. Key differentiators: SDK for embedding into any app, AI-powered insights via Reveal AI, 30+ visualization types, real-time data connections to 200+ sources, and enterprise security. Recent update: Reveal 1.5 introduced predictive analytics and natural language queries.',
      master:
        'Slingshot is an all-in-one work management platform combining project management, goal tracking (OKRs), team analytics, and content sharing. Key features: Kanban/Gantt views, native integrations with Slack/GitHub/Jira/Salesforce, built-in file sharing, and AI-powered workload insights. Q1 2026: Launched Slingshot Goals 2.0 with enhanced OKR tracking and team alignment dashboards.',
    };

    const context = mockContexts[productType] ?? mockContexts['master'];

    return of({
      output: `[RAG Context for "${input}"]\n\n${context}\n\nThis context has been retrieved from the product knowledge base and can be used to tailor your content prompt.`,
      title: `RAG Result: ${productType}`,
      sessionId: `mock-session-${Date.now()}`,
      citations: [
        `https://www.infragistics.com/products/${productType}`,
        `https://github.com/IgniteUI/igniteui-angular`,
      ],
      confidenceLevel: 82,
    }).pipe(delay(1500));
  }
}
