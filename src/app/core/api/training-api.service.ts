import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type {
  TrainingCertificateView,
  TrainingLessonDetailView,
  TrainingLessonSummary,
  TrainingQuizResultView,
} from './contracts';

@Injectable({ providedIn: 'root' })
export class TrainingApiService {
  private readonly api = inject(ApiClientService);

  listLessons(): Observable<TrainingLessonSummary[]> {
    return this.api.get<TrainingLessonSummary[]>('/training/lessons');
  }

  getLessonDetail(code: string): Observable<TrainingLessonDetailView> {
    return this.api.get<TrainingLessonDetailView>(`/training/lessons/${code}`);
  }

  submitQuiz(code: string, answers: number[]): Observable<TrainingQuizResultView> {
    return this.api.post<TrainingQuizResultView>(`/training/lessons/${code}/submit`, { answers });
  }

  myCertificates(): Observable<TrainingCertificateView[]> {
    return this.api.get<TrainingCertificateView[]>('/training/certificates');
  }
}
