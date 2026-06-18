import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCourse } from '../content';
import { Badge, Button, Card, ProgressBar } from '../components/ui';
import { useProgress } from '../state/ProgressContext';
import { analyzeWeaknesses, recommendResources, summarizeCourse } from '../state/progress';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

export const ProgressScreen: React.FC<Props> = ({ navigation, route }) => {
  const { language } = route.params;
  const course = getCourse(language);
  const { progress, reset } = useProgress();

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${course.name} Progress` });
  }, [navigation, course.name]);

  const summary = summarizeCourse(progress, course);
  const weaknesses = analyzeWeaknesses(progress, course);
  const recs = recommendResources(progress, course);

  const confirmReset = () => {
    Alert.alert('Reset all progress?', 'This clears every course on this device. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.overallPct}>{summary.percent}%</Text>
        <Text style={styles.overallLabel}>course complete</Text>
        <ProgressBar percent={summary.percent} color={course.accent} />
        <View style={styles.statGrid}>
          <Stat label="Lessons" done={summary.lessonsViewed} total={summary.lessonsTotal} />
          <Stat label="Exercises" done={summary.exercisesDone} total={summary.exercisesTotal} />
          <Stat label="Quiz Qs" done={summary.quizDone} total={summary.quizTotal} />
        </View>
      </Card>

      <Text style={styles.section}>Concept mastery</Text>
      <Card>
        {course.concepts.map((c) => {
          const stat = progress.concepts[c.id];
          const mastery = stat && stat.total > 0 ? stat.correct / stat.total : null;
          return (
            <View key={c.id} style={styles.conceptRow}>
              <View style={styles.conceptHead}>
                <Text style={styles.conceptName}>{c.name}</Text>
                <Text style={styles.conceptPct}>
                  {mastery === null ? '—' : `${Math.round(mastery * 100)}%`}
                </Text>
              </View>
              <ProgressBar
                percent={mastery === null ? 0 : mastery * 100}
                color={
                  mastery === null
                    ? theme.colors.border
                    : mastery >= 0.7
                      ? theme.colors.success
                      : theme.colors.warning
                }
              />
            </View>
          );
        })}
      </Card>

      {weaknesses.length > 0 ? (
        <>
          <Text style={styles.section}>Your weak spots</Text>
          <Card>
            {weaknesses.map((w) => (
              <View key={w.concept} style={styles.weakRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.weakName}>{w.name}</Text>
                  <Text style={styles.weakBlurb}>{w.blurb}</Text>
                </View>
                <Badge
                  text={`${Math.round(w.mastery * 100)}%`}
                  textStyle={{ color: theme.colors.danger }}
                />
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Card>
          <Text style={styles.allGood}>
            No weak spots detected yet. Answer more exercises and quizzes to get a tailored report.
          </Text>
        </Card>
      )}

      {recs.length > 0 && (
        <>
          <Text style={styles.section}>Recommended for you</Text>
          {recs.map((r) => (
            <TouchableOpacity
              key={r.resourceId}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Resource', { language, resourceId: r.resourceId })}
            >
              <Card>
                <Text style={styles.recTitle}>📖 {r.title}</Text>
                <Text style={styles.recReason}>{r.reason}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.section}>All resources</Text>
      {course.resources.map((r) => (
        <TouchableOpacity
          key={r.id}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Resource', { language, resourceId: r.id })}
        >
          <Card>
            <Text style={styles.recTitle}>{r.title}</Text>
          </Card>
        </TouchableOpacity>
      ))}

      <Button
        title="Reset all progress"
        variant="ghost"
        onPress={confirmReset}
        style={{ marginTop: theme.spacing(2) }}
      />
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; done: number; total: number }> = ({ label, done, total }) => (
  <View style={styles.statBox}>
    <Text style={styles.statNum}>
      {done}/{total}
    </Text>
    <Text style={styles.statName}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  overallPct: { color: theme.colors.text, fontSize: 40, fontWeight: '800', textAlign: 'center' },
  overallLabel: { color: theme.colors.textDim, textAlign: 'center', marginBottom: 12 },
  statGrid: { flexDirection: 'row', marginTop: theme.spacing(1.5), gap: theme.spacing(1) },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  statName: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  section: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: theme.spacing(2.5), marginBottom: theme.spacing(1) },
  conceptRow: { marginBottom: theme.spacing(1.25) },
  conceptHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  conceptName: { color: theme.colors.text, fontSize: 14 },
  conceptPct: { color: theme.colors.textDim, fontSize: 13, fontWeight: '600' },
  weakRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  weakName: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  weakBlurb: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  allGood: { color: theme.colors.textDim, fontSize: 14, lineHeight: 20 },
  recTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  recReason: { color: theme.colors.accent, fontSize: 13, marginTop: 4 },
});
