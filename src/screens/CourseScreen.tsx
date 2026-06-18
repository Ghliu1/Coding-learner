import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCourse } from '../content';
import { Badge, Card } from '../components/ui';
import { useProgress } from '../state/ProgressContext';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Course'>;

export const CourseScreen: React.FC<Props> = ({ navigation, route }) => {
  const { language } = route.params;
  const course = getCourse(language);
  const { progress } = useProgress();

  useLayoutEffect(() => {
    navigation.setOptions({ title: course.name });
  }, [navigation, course.name]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.desc}>{course.description}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Progress', { language })}
        >
          <Text style={styles.actionText}>📊 Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Reference', { language })}
        >
          <Text style={styles.actionText}>📚 Reference</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Playground', { language })}
        >
          <Text style={styles.actionText}>⌨️ Playground</Text>
        </TouchableOpacity>
      </View>

      {course.modules.map((mod, mi) => (
        <View key={mod.id} style={styles.module}>
          <Text style={styles.moduleTitle}>
            {mi + 1}. {mod.title}
          </Text>
          <Text style={styles.moduleDesc}>{mod.description}</Text>
          {mod.lessons.map((lesson) => {
            const done = progress.lessonsViewed[lesson.id];
            const exDone = lesson.exercises.filter((e) => progress.exercisesCompleted[e.id]).length;
            return (
              <TouchableOpacity
                key={lesson.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Lesson', { language, lessonId: lesson.id })}
              >
                <Card style={styles.lessonCard}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.checkmark}>{done ? '✓' : '○'}</Text>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  </View>
                  <Text style={styles.lessonSummary}>{lesson.summary}</Text>
                  <View style={styles.lessonMeta}>
                    <Badge text={`${lesson.estimatedMinutes} min`} />
                    {lesson.exercises.length > 0 && (
                      <Badge
                        text={`${exDone}/${lesson.exercises.length} exercises`}
                        color={
                          exDone === lesson.exercises.length && exDone > 0
                            ? theme.colors.surfaceAlt
                            : theme.colors.surfaceAlt
                        }
                        textStyle={
                          exDone === lesson.exercises.length && exDone > 0
                            ? { color: theme.colors.success }
                            : undefined
                        }
                      />
                    )}
                    {lesson.quiz.length > 0 && <Badge text={`${lesson.quiz.length} quiz Q`} />}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  desc: { color: theme.colors.textDim, fontSize: 14, marginBottom: theme.spacing(2), lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: theme.spacing(1), marginBottom: theme.spacing(2) },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  module: { marginBottom: theme.spacing(2) },
  moduleTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700', marginBottom: 2 },
  moduleDesc: { color: theme.colors.textDim, fontSize: 13, marginBottom: theme.spacing(1) },
  lessonCard: { marginBottom: theme.spacing(1) },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checkmark: { color: theme.colors.success, fontSize: 16, fontWeight: '800', marginRight: 8, width: 16 },
  lessonTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  lessonSummary: { color: theme.colors.textDim, fontSize: 13, marginBottom: 8, marginLeft: 24 },
  lessonMeta: { flexDirection: 'row', gap: 8, marginLeft: 24 },
});
