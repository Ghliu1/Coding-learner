import { LanguageId } from '../content/types';

export type RootStackParamList = {
  Home: undefined;
  Course: { language: LanguageId };
  Lesson: { language: LanguageId; lessonId: string };
  Exercise: { exerciseId: string };
  Quiz: { language: LanguageId; lessonId?: string };
  Playground: { language: LanguageId } | undefined;
  Reference: { language: LanguageId };
  Resource: { language: LanguageId; resourceId: string };
  Progress: { language: LanguageId };
};
