import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { courses } from '../content';
import { Badge, Card, ProgressBar } from '../components/ui';
import { useProgress } from '../state/ProgressContext';
import { analyzeWeaknesses, summarizeCourse } from '../state/progress';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { progress } = useProgress();

  const totalWeak = courses
    .flatMap((c) => analyzeWeaknesses(progress, c))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Coding Learner</Text>
      <Text style={styles.subtitle}>Learn to code offline — lessons, exercises & tests.</Text>

      <View style={styles.statsRow}>
        <Stat label="Day streak" value={`${progress.streak}🔥`} />
        <Stat label="Points" value={`${progress.points}`} />
        <Stat
          label="Lessons read"
          value={`${Object.keys(progress.lessonsViewed).length}`}
        />
      </View>

      <Text style={styles.section}>Courses</Text>
      {courses.map((course) => {
        const sum = summarizeCourse(progress, course);
        return (
          <TouchableOpacity
            key={course.language}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Course', { language: course.language })}
          >
            <Card>
              <View style={styles.courseHeader}>
                <View style={[styles.dot, { backgroundColor: course.accent }]} />
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.percent}>{sum.percent}%</Text>
              </View>
              <Text style={styles.tagline}>{course.tagline}</Text>
              <ProgressBar percent={sum.percent} color={course.accent} />
              <View style={styles.metaRow}>
                <Badge text={`${sum.lessonsTotal} lessons`} />
                <Badge text={`${sum.exercisesTotal} exercises`} />
                <Badge text={`${sum.quizTotal} quizzes`} />
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}

      {totalWeak.length > 0 && (
        <>
          <Text style={styles.section}>Focus areas</Text>
          <Card>
            <Text style={styles.focusIntro}>
              Based on your answers, these concepts need a little more practice:
            </Text>
            {totalWeak.map((w) => (
              <View key={w.concept} style={styles.weakRow}>
                <Text style={styles.weakName}>{w.name}</Text>
                <Badge
                  text={`${Math.round(w.mastery * 100)}%`}
                  color={theme.colors.surfaceAlt}
                  textStyle={{ color: theme.colors.danger }}
                />
              </View>
            ))}
            <Text style={styles.focusHint}>
              Open a course's Progress tab for targeted resources.
            </Text>
          </Card>
        </>
      )}

      <Text style={styles.section}>Practice freely</Text>
      <View style={styles.playgroundRow}>
        {courses.map((c) => (
          <TouchableOpacity
            key={c.language}
            style={[styles.playBtn, { borderColor: c.accent }]}
            onPress={() => navigation.navigate('Playground', { language: c.language })}
          >
            <Text style={[styles.playText, { color: c.accent }]}>{c.name} Playground</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.footer}>100% offline · your progress stays on this device</Text>
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: theme.colors.textDim, fontSize: 14, marginTop: 4, marginBottom: theme.spacing(2) },
  statsRow: { flexDirection: 'row', gap: theme.spacing(1.5), marginBottom: theme.spacing(1) },
  stat: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(1.5),
    alignItems: 'center',
  },
  statValue: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  section: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
  },
  courseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  courseName: { color: theme.colors.text, fontSize: 18, fontWeight: '700', flex: 1 },
  percent: { color: theme.colors.textDim, fontWeight: '700' },
  tagline: { color: theme.colors.textDim, fontSize: 13, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  focusIntro: { color: theme.colors.text, fontSize: 14, marginBottom: 10 },
  weakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  weakName: { color: theme.colors.text, fontSize: 14 },
  focusHint: { color: theme.colors.textDim, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  playgroundRow: { flexDirection: 'row', gap: theme.spacing(1.5) },
  playBtn: { flex: 1, borderWidth: 1, borderRadius: theme.radius, padding: theme.spacing(1.5), alignItems: 'center' },
  playText: { fontWeight: '700' },
  footer: { color: theme.colors.textDim, fontSize: 12, textAlign: 'center', marginTop: theme.spacing(3) },
});
