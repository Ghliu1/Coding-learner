import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { findLesson } from '../content';
import { ContentBlocks } from '../components/ContentBlocks';
import { Badge, Button, Card, Divider } from '../components/ui';
import { useProgress } from '../state/ProgressContext';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export const LessonScreen: React.FC<Props> = ({ navigation, route }) => {
  const { language, lessonId } = route.params;
  const lesson = findLesson(language, lessonId);
  const { progress, onLessonViewed } = useProgress();

  useEffect(() => {
    if (lesson) onLessonViewed(lesson.id);
  }, [lesson, onLessonViewed]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: lesson?.title ?? 'Lesson' });
  }, [navigation, lesson?.title]);

  if (!lesson) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Lesson not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.summary}>{lesson.summary}</Text>
      <ContentBlocks blocks={lesson.content} />

      <Divider />

      {lesson.exercises.length > 0 && (
        <>
          <Text style={styles.section}>Exercises</Text>
          {lesson.exercises.map((ex) => {
            const done = progress.exercisesCompleted[ex.id];
            return (
              <TouchableOpacity
                key={ex.id}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Exercise', { exerciseId: ex.id })}
              >
                <Card>
                  <View style={styles.exHeader}>
                    <Text style={styles.checkmark}>{done ? '✓' : '⌨'}</Text>
                    <Text style={styles.exTitle}>{ex.title}</Text>
                  </View>
                  <Text style={styles.exPrompt} numberOfLines={2}>
                    {ex.prompt}
                  </Text>
                  {done && <Badge text="Completed" textStyle={{ color: theme.colors.success }} />}
                </Card>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {lesson.quiz.length > 0 && (
        <View style={styles.quizCta}>
          <Button
            title={`Take the quiz (${lesson.quiz.length} questions)`}
            onPress={() => navigation.navigate('Quiz', { language, lessonId: lesson.id })}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  summary: { color: theme.colors.textDim, fontSize: 15, fontStyle: 'italic', marginBottom: theme.spacing(1) },
  section: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: theme.spacing(1) },
  exHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checkmark: { color: theme.colors.accent, fontSize: 16, marginRight: 8, width: 18 },
  exTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  exPrompt: { color: theme.colors.textDim, fontSize: 13, marginBottom: 8, marginLeft: 26 },
  quizCta: { marginTop: theme.spacing(2) },
  missing: { color: theme.colors.textDim, padding: theme.spacing(3) },
});
