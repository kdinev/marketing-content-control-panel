import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { ContentMedium, LlmModel, MEDIUM_LABELS } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class LlmService {
  private readonly http = inject(HttpClient);

  private openAiKey = '';
  private anthropicKey = '';
  private googleKey = '';

  setKeys(keys: { openai?: string; anthropic?: string; google?: string }): void {
    if (keys.openai !== undefined) this.openAiKey = keys.openai;
    if (keys.anthropic !== undefined) this.anthropicKey = keys.anthropic;
    if (keys.google !== undefined) this.googleKey = keys.google;
  }

  generateContent(prompt: string, model: LlmModel, medium: ContentMedium): Observable<string> {
    const provider = this.getProvider(model);
    const key = this.getKey(provider);
    const mediumLabel = MEDIUM_LABELS[medium];

    if (!key) {
      return of(this.buildMockContent(prompt, model, medium, mediumLabel));
    }

    return this.callApi(provider, model, key, this.buildSystemPrompt(medium), prompt).pipe(
      catchError(() => of(this.buildMockContent(prompt, model, medium, mediumLabel)))
    );
  }

  private getProvider(model: LlmModel): 'openai' | 'anthropic' | 'google' {
    if (model === 'gpt-5o' || model === 'gpt-5-turbo') return 'openai';
    if (model === 'claude-4-5-sonnet' || model === 'claude-4-haiku') return 'anthropic';
    return 'google';
  }

  private getKey(provider: 'openai' | 'anthropic' | 'google'): string {
    if (provider === 'openai') return this.openAiKey;
    if (provider === 'anthropic') return this.anthropicKey;
    return this.googleKey;
  }

  private callApi(
    provider: 'openai' | 'anthropic' | 'google',
    model: LlmModel,
    key: string,
    systemPrompt: string,
    userPrompt: string
  ): Observable<string> {
    if (provider === 'openai') return this.callOpenAi(model, key, systemPrompt, userPrompt);
    if (provider === 'anthropic') return this.callAnthropic(model, key, systemPrompt, userPrompt);
    return this.callGoogle(model, key, systemPrompt, userPrompt);
  }

  private callOpenAi(
    model: LlmModel,
    key: string,
    systemPrompt: string,
    userPrompt: string
  ): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    });
    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
    };
    return this.http
      .post<{ choices: { message: { content: string } }[] }>(
        'https://api.openai.com/v1/chat/completions',
        body,
        { headers }
      )
      .pipe(map((r) => r.choices[0].message.content));
  }

  private callAnthropic(
    model: LlmModel,
    key: string,
    systemPrompt: string,
    userPrompt: string
  ): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    });
    const body = {
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 2000,
    };
    return this.http
      .post<{ content: { type: string; text: string }[] }>(
        'https://api.anthropic.com/v1/messages',
        body,
        { headers }
      )
      .pipe(map((r) => r.content[0].text));
  }

  private callGoogle(
    model: LlmModel,
    key: string,
    systemPrompt: string,
    userPrompt: string
  ): Observable<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    };
    return this.http
      .post<{ candidates: { content: { parts: { text: string }[] } }[] }>(url, body)
      .pipe(map((r) => r.candidates[0].content.parts[0].text));
  }

  private buildSystemPrompt(medium: ContentMedium): string {
    const prompts: Record<ContentMedium, string> = {
      blog: 'You are a senior content writer. Write a well-structured blog post in Markdown with a compelling title, introduction, key takeaways as bullet points, a deep-dive section, and a conclusion. Use ## and ### headings. Aim for 400–600 words.',
      forum: 'You are a community manager. Write an engaging forum post that invites discussion. Include a bold subject line, a conversational opening, the main content, and a question to spark replies.',
      facebook:
        'You are a social media specialist. Write an engaging Facebook post. Use 1–2 emojis, keep it under 250 words, include a call-to-action, and end with 3–5 relevant hashtags.',
      linkedin:
        'You are a LinkedIn content strategist. Write a professional LinkedIn post with a hook opening, a bold key insight, 3–5 bullet points using ✅, a closing call-to-action, and 4–6 professional hashtags.',
      twitter:
        'You are a Twitter/X copywriter. Write a punchy tweet (max 280 characters) with a strong hook, one relevant emoji, and 2–3 hashtags. Be concise and impactful.',
    };
    return prompts[medium];
  }

  private buildMockContent(
    prompt: string,
    model: LlmModel,
    medium: ContentMedium,
    mediumLabel: string
  ): string {
    const templates: Record<ContentMedium, (p: string) => string> = {
      blog: (p) =>
        `# ${this.extractTitle(p)}\n\n## Introduction\n\nIn today's fast-paced digital landscape, staying ahead of the curve is essential. ${p}\n\n## Key Takeaways\n\n- Insight 1: Modern solutions require modern tools\n- Insight 2: Empowering teams drives measurable results\n- Insight 3: The right technology makes all the difference\n\n## Deep Dive\n\nLet's explore how this applies in practice. Our product team has worked tirelessly to ensure that developers and marketing professionals alike can benefit from these advancements.\n\n## Conclusion\n\nBy leveraging these capabilities, your team can achieve greater efficiency and impact. Ready to get started? [Learn more](#).`,
      forum: (p) =>
        `**[Discussion] ${this.extractTitle(p)}**\n\nHey everyone! Wanted to share some thoughts on this topic.\n\n${p}\n\nHas anyone else had experience with this? Would love to hear your thoughts and how you've approached similar challenges.\n\n*Tags: product, update, discussion*`,
      facebook: (p) =>
        `🚀 Exciting news from our team!\n\n${this.extractTitle(p)}\n\n${this.truncate(p, 200)}\n\nClick the link to learn more 👇\n\n#Innovation #TechNews #ProductUpdate`,
      linkedin: (p) =>
        `I'm thrilled to share something that's been transforming how teams work 🎯\n\n**${this.extractTitle(p)}**\n\n${this.truncate(p, 300)}\n\nHere's what makes this particularly exciting:\n✅ Faster time to value\n✅ Better team collaboration\n✅ Data-driven decision making\n\nWant to know more? Drop a comment or reach out directly.\n\n#ProductUpdate #Tech #Innovation #Leadership`,
      twitter: (p) =>
        `🔥 ${this.extractTitle(p)}\n\n${this.truncate(p, 200)}\n\nLearn more 👉 [link]\n\n#Tech #Innovation #ProductUpdate`,
    };
    return templates[medium](prompt);
  }

  private extractTitle(prompt: string): string {
    const first = prompt.split('.')[0].split('\n')[0];
    return first.length > 60 ? first.substring(0, 60) + '...' : first;
  }

  private truncate(text: string, maxLen: number): string {
    const clean = text.replace(/\[RAG Context[^\]]*\][^\n]*/g, '').trim();
    if (clean.length <= maxLen) return clean;
    return clean.substring(0, maxLen - 3) + '...';
  }
}
