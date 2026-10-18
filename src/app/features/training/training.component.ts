import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrainingApiService } from '../../core/api/training-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type {
  TrainingLessonDetailView,
  TrainingLessonSummary,
  TrainingQuizResultView,
} from '../../core/api/contracts';

/** Staff training (Module P) — short lessons with a real graded quiz and a certificate on passing. */
@Component({
  selector: 'app-training',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent {
  private readonly trainingApi = inject(TrainingApiService);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly lessons = signal<TrainingLessonSummary[] | null | undefined>(undefined);
  readonly activeLesson = signal<TrainingLessonDetailView | null>(null);
  readonly answers = signal<number[]>([]);
  readonly result = signal<TrainingQuizResultView | null>(null);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.trainingApi.listLessons().subscribe({
      next: (lessons) => this.lessons.set(lessons),
      error: () => this.lessons.set(null),
    });
  }

  openLesson(code: string): void {
    this.result.set(null);
    this.errorMessage.set(null);
    this.trainingApi.getLessonDetail(code).subscribe({
      next: (detail) => {
        this.activeLesson.set(detail);
        this.answers.set(new Array(detail.quiz.length).fill(-1));
      },
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  closeLesson(): void {
    this.activeLesson.set(null);
    this.result.set(null);
  }

  setAnswer(index: number, value: number): void {
    this.answers.update((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  submitQuiz(): void {
    const lesson = this.activeLesson();
    if (!lesson) return;
    if (this.answers().some((a) => a < 0)) {
      this.errorMessage.set(
        this.language() === 'hi' ? 'सभी सवालों के जवाब दें।' : 'Answer every question.',
      );
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.trainingApi.submitQuiz(lesson.code, this.answers()).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.result.set(result);
        this.load();
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
