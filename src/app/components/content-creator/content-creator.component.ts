import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { IgxStepperComponent, IGX_STEPPER_DIRECTIVES } from '@infragistics/igniteui-angular/stepper';
import { IGX_TABS_DIRECTIVES } from '@infragistics/igniteui-angular/tabs';
import { IgxChatComponent, type IgxChatOptions } from '@infragistics/igniteui-angular/chat';
import { IGX_INPUT_GROUP_DIRECTIVES } from '@infragistics/igniteui-angular/input-group';
import { IgxIconComponent } from '@infragistics/igniteui-angular/icon';
import { IgxButtonDirective, IgxRippleDirective, IgxIconButtonDirective } from '@infragistics/igniteui-angular/directives';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective, IgxCardHeaderTitleDirective, IgxCardHeaderSubtitleDirective } from '@infragistics/igniteui-angular/card';
import { IgxChipComponent, IgxChipsAreaComponent } from '@infragistics/igniteui-angular/chips';
import { IgxSnackbarComponent } from '@infragistics/igniteui-angular/snackbar';
import { IgxDatePickerComponent } from '@infragistics/igniteui-angular/date-picker';
import { IgxLinearProgressBarComponent } from '@infragistics/igniteui-angular/progressbar';
import { IGX_BUTTON_GROUP_DIRECTIVES } from '@infragistics/igniteui-angular/button-group';
import { ContentService } from '../../services/content.service';
import { RagService } from '../../services/rag.service';
import { LlmService } from '../../services/llm.service';
import {
  ProductArea,
  ContentMedium,
  LlmModel,
  ContentCreationState,
  ReviewerAssignment,
  PRODUCT_AREA_LABELS,
  PRODUCT_AREA_ICONS,
  PRODUCT_AREA_RAG_TYPE,
  MEDIUM_LABELS,
  MEDIUM_ICONS,
  LLM_MODEL_LABELS,
} from '../../models/content.model';

@Component({
  selector: 'app-content-creator',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IGX_STEPPER_DIRECTIVES,
    IGX_INPUT_GROUP_DIRECTIVES,
    IgxIconComponent,
    IgxButtonDirective,
    IgxIconButtonDirective,
    IgxRippleDirective,
    IgxCardComponent,
    IgxCardHeaderComponent,
    IgxCardContentDirective,
    IgxCardHeaderTitleDirective,
    IgxCardHeaderSubtitleDirective,
    IgxChipComponent,
    IgxChipsAreaComponent,
    IgxSnackbarComponent,
    IgxDatePickerComponent,
    IgxLinearProgressBarComponent,
    IGX_BUTTON_GROUP_DIRECTIVES,
    IGX_TABS_DIRECTIVES,
    IgxChatComponent,
  ],
  templateUrl: './content-creator.component.html',
  styleUrl: './content-creator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCreatorComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);
  private readonly ragService = inject(RagService);
  private readonly llmService = inject(LlmService);

  readonly stepper = viewChild.required<IgxStepperComponent>('stepper');
  readonly snackbar = viewChild.required<IgxSnackbarComponent>('snackbar');

  // Pre-populate area from query params
  private readonly queryArea = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('area') as ProductArea | null)),
    { initialValue: null }
  );

  // Step states
  readonly state = signal<ContentCreationState>({
    productArea: null,
    mediums: [],
    prompt: '',
    ragContext: '',
    augmentedPrompt: '',
    model: null,
    generatedContent: {} as Record<ContentMedium, string>,
    finalContent: {} as Record<ContentMedium, string>,
    scheduleDate: null,
    publishImmediately: true,
    chatMessages: [],
    reviewers: [],
    reviewNote: '',
  });

  readonly currentStep = signal(0);
  readonly isRagLoading = signal(false);
  readonly isGenerating = signal(false);
  readonly generatingMedium = signal<ContentMedium | null>(null);
  readonly generationProgress = signal(0);
  readonly snackbarMessage = signal('');
  readonly apiTokenInput = signal('');
  readonly openAiKeyInput = signal('');
  readonly anthropicKeyInput = signal('');
  readonly googleKeyInput = signal('');
  readonly today = new Date();
  readonly scheduleDate = signal<Date | null>(null);
  readonly isChatRefining = signal(false);
  readonly chatDraftMessage = signal<{ text: string }>({ text: '' });
  readonly reviewerNameInput = signal('');
  readonly reviewerEmailInput = signal('');

  // Derived
  readonly productAreas: ProductArea[] = ['dev-tools', 'reveal', 'slingshot'];
  readonly allMediums: ContentMedium[] = ['blog', 'forum', 'facebook', 'linkedin', 'twitter'];
  readonly allModels: LlmModel[] = [
    'gpt-5o',
    'gpt-5-turbo',
    'claude-4-5-sonnet',
    'claude-4-haiku',
    'gemini-3.1-pro-preview',
  ];

  readonly step1Valid = computed(() => {
    const s = this.state();
    return !!s.productArea && s.mediums.length > 0 && s.prompt.trim().length > 10;
  });

  readonly step2Valid = computed(() => !!this.state().ragContext);

  readonly step3Valid = computed(() => !!this.state().model);

  readonly step4Valid = computed(() => {
    const s = this.state();
    return s.mediums.every((m) => (s.finalContent[m] ?? '').trim().length > 0);
  });

  readonly chatOptions = computed<IgxChatOptions>(() => ({
    currentUserId: 'user',
    headerText: 'AI Content Refinement',
    inputPlaceholder: 'Ask to refine the content...',
    isTyping: this.isChatRefining(),
    disableInputAttachments: true,
  }));

  readonly generatedMediums = computed(() => Object.keys(this.state().finalContent) as ContentMedium[]);

  readonly allGenerated = computed(() => {
    const s = this.state();
    return s.mediums.length > 0 && s.mediums.every((m) => !!(s.finalContent[m]));
  });

  constructor() {
    // Pre-fill area from query params
    const area = this.queryArea();
    if (area) {
      this.state.update((s) => ({ ...s, productArea: area }));
    }
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

  getMediumIcon(medium: ContentMedium): string {
    return MEDIUM_ICONS[medium];
  }

  getModelLabel(model: LlmModel): string {
    return LLM_MODEL_LABELS[model];
  }

  isMediumSelected(medium: ContentMedium): boolean {
    return this.state().mediums.includes(medium);
  }

  toggleMedium(medium: ContentMedium): void {
    this.state.update((s) => {
      const mediums = s.mediums.includes(medium)
        ? s.mediums.filter((m) => m !== medium)
        : [...s.mediums, medium];
      return { ...s, mediums };
    });
  }

  selectArea(area: ProductArea): void {
    this.state.update((s) => ({ ...s, productArea: area }));
  }

  updatePrompt(val: string): void {
    this.state.update((s) => ({ ...s, prompt: val }));
  }

  updateAugmentedPrompt(val: string): void {
    this.state.update((s) => ({ ...s, augmentedPrompt: val }));
  }

  selectModel(model: LlmModel): void {
    this.state.update((s) => ({ ...s, model }));
  }

  updateFinalContent(medium: ContentMedium, val: string): void {
    this.state.update((s) => ({
      ...s,
      finalContent: { ...s.finalContent, [medium]: val },
    }));
  }

  setApiToken(val: string): void {
    this.apiTokenInput.set(val);
    this.ragService.setToken(val);
  }

  setLlmKey(provider: 'openai' | 'anthropic' | 'google', val: string): void {
    if (provider === 'openai') this.openAiKeyInput.set(val);
    else if (provider === 'anthropic') this.anthropicKeyInput.set(val);
    else this.googleKeyInput.set(val);
    this.llmService.setKeys({
      openai: this.openAiKeyInput(),
      anthropic: this.anthropicKeyInput(),
      google: this.googleKeyInput(),
    });
  }

  // Step 1 → Step 2: Run RAG
  async runRag(): Promise<void> {
    const s = this.state();
    if (!s.productArea) return;

    this.isRagLoading.set(true);
    const productType = PRODUCT_AREA_RAG_TYPE[s.productArea];
    const obs = productType === 'master'
      ? this.ragService.invokeMasterAgent(s.prompt)
      : this.ragService.invokeByProductType(s.prompt, productType);

    obs.subscribe({
      next: (response) => {
        const augmented = `${s.prompt}\n\n---\n### Product Knowledge Context:\n${response.output}`;
        this.state.update((st) => ({
          ...st,
          ragContext: response.output,
          augmentedPrompt: augmented,
        }));
        this.isRagLoading.set(false);
        this.stepper().next();
        this.currentStep.set(1);
      },
      error: () => {
        this.isRagLoading.set(false);
        this.showSnackbar('Failed to connect to RAG service. Please check your API token.');
      },
    });
  }

  // Step 3: Generate content for all mediums
  async generateAllContent(): Promise<void> {
    const s = this.state();
    if (!s.model) return;

    this.isGenerating.set(true);
    this.generationProgress.set(0);

    const total = s.mediums.length;
    let done = 0;

    for (const medium of s.mediums) {
      this.generatingMedium.set(medium);
      await new Promise<void>((resolve) => {
        this.llmService.generateContent(s.augmentedPrompt || s.prompt, s.model!, medium).subscribe({
          next: (content) => {
            this.state.update((st) => ({
              ...st,
              generatedContent: { ...st.generatedContent, [medium]: content },
              finalContent: { ...st.finalContent, [medium]: content },
            }));
            done++;
            this.generationProgress.set(Math.round((done / total) * 100));
            resolve();
          },
          error: () => {
            done++;
            this.generationProgress.set(Math.round((done / total) * 100));
            resolve();
          },
        });
      });
    }

    this.isGenerating.set(false);
    this.generatingMedium.set(null);

    // Initialise the chat with a welcome message for the Refine step
    const mediumNames = this.state().mediums.map((m) => MEDIUM_LABELS[m]).join(', ');
    const welcomeMsg = {
      id: 'ai-welcome',
      text:
        `I've generated content for ${mediumNames}. ` +
        `Ask me to refine any piece — for example: "Make the Twitter post punchier", ` +
        `"Add more technical depth to the blog post", or "Make all content more formal". ` +
        `When you're happy, click **Proceed to Review**.`,
      sender: 'ai',
      timestamp: Date.now().toString(),
    };
    this.state.update((st) => ({ ...st, chatMessages: [welcomeMsg] }));
    this.chatDraftMessage.set({ text: '' });

    this.stepper().next();
    this.currentStep.set(3);
  }

  // Step navigation
  nextStep(): void {
    this.stepper().next();
    this.currentStep.update((s) => s + 1);
  }

  prevStep(): void {
    this.stepper().prev();
    this.currentStep.update((s) => Math.max(0, s - 1));
  }

  // Chat refinement (Step 4)
  onChatMessageCreated(msg: { id: string; text: string; sender?: string; timestamp?: string }): void {
    const userMsg = {
      id: msg.id,
      text: msg.text,
      sender: 'user',
      timestamp: msg.timestamp ?? Date.now().toString(),
    };
    this.state.update((st) => ({ ...st, chatMessages: [...st.chatMessages, userMsg] }));
    this.chatDraftMessage.set({ text: '' });
    this.isChatRefining.set(true);

    const s = this.state();
    this.llmService
      .refineContent(msg.text, s.finalContent, s.model!, s.mediums)
      .subscribe({
        next: ({ reply, updatedContent }) => {
          const aiMsg = {
            id: `ai-${Date.now()}`,
            text: reply,
            sender: 'ai',
            timestamp: Date.now().toString(),
          };
          this.state.update((st) => ({
            ...st,
            finalContent: updatedContent,
            chatMessages: [...st.chatMessages, aiMsg],
          }));
          this.isChatRefining.set(false);
        },
        error: () => {
          const errMsg = {
            id: `ai-err-${Date.now()}`,
            text: 'Sorry, I had trouble processing that. Please try again.',
            sender: 'ai',
            timestamp: Date.now().toString(),
          };
          this.state.update((st) => ({
            ...st,
            chatMessages: [...st.chatMessages, errMsg],
          }));
          this.isChatRefining.set(false);
        },
      });
  }

  // Reviewer assignment (Step 6)
  addReviewer(): void {
    const name = this.reviewerNameInput().trim();
    if (!name) return;
    const reviewer: ReviewerAssignment = {
      id: crypto.randomUUID(),
      name,
      email: this.reviewerEmailInput().trim(),
    };
    this.state.update((st) => ({ ...st, reviewers: [...st.reviewers, reviewer] }));
    this.reviewerNameInput.set('');
    this.reviewerEmailInput.set('');
  }

  removeReviewer(id: string): void {
    this.state.update((st) => ({
      ...st,
      reviewers: st.reviewers.filter((r) => r.id !== id),
    }));
  }

  updateReviewNote(val: string): void {
    this.state.update((st) => ({ ...st, reviewNote: val }));
  }

  // Final submit
  submitContent(publishImmediately: boolean): void {
    const s = this.state();
    if (!s.productArea || !s.model) return;

    const status = publishImmediately ? 'published' : (this.scheduleDate() ? 'scheduled' : 'pipeline');
    const firstMedium = s.mediums[0];
    const body = s.finalContent[firstMedium] ?? '';

    this.contentService.addContent({
      title: this.extractTitle(s.prompt),
      excerpt: this.extractExcerpt(body),
      body,
      productArea: s.productArea,
      mediums: s.mediums,
      status,
      model: s.model,
      tags: [],
      publishedAt: publishImmediately ? new Date().toISOString() : undefined,
      scheduledAt: !publishImmediately && this.scheduleDate()
        ? this.scheduleDate()!.toISOString()
        : undefined,
      ragContext: s.ragContext,
      prompt: s.prompt,
      reviewers: s.reviewers.length > 0 ? s.reviewers : undefined,
      reviewNote: s.reviewNote.trim() || undefined,
    });

    this.showSnackbar(
      publishImmediately
        ? 'Content submitted for immediate posting!'
        : 'Content scheduled successfully!'
    );

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private showSnackbar(msg: string): void {
    this.snackbarMessage.set(msg);
    this.snackbar().open(msg);
  }

  private extractTitle(prompt: string): string {
    const first = prompt.split('.')[0].split('\n')[0].trim();
    return first.length > 80 ? first.substring(0, 80) + '...' : first;
  }

  private extractExcerpt(body: string): string {
    const stripped = body.replace(/^#+\s.+\n?/gm, '').trim();
    return stripped.substring(0, 160) + '...';
  }
}
