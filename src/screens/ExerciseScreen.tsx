import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { findExercise } from '../content';
import { CodeEditor } from '../components/CodeEditor';
import { Badge, Button, Card } from '../components/ui';
import { Evaluation, evaluateExerciseAsync } from '../engine/runner';
import { useProgress } from '../state/ProgressContext';
import { loadCode, saveCode } from '../state/storage';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Exercise'>;

export const ExerciseScreen: React.FC<Props> = ({ navigation, route }) => {
  const { exerciseId } = route.params;
  const found = useMemo(() => findExercise(exerciseId), [exerciseId]);
  const { onExerciseAttempt } = useProgress();

  const [code, setCode] = useState(found?.exercise.starterCode ?? '');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [running, setRunning] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: found?.exercise.title ?? 'Exercise' });
  }, [navigation, found?.exercise.title]);

  // Restore any previously saved code for this exercise.
  useEffect(() => {
    let active = true;
    loadCode(exerciseId).then((saved) => {
      if (active && saved != null) setCode(saved);
    });
    return () => {
      active = false;
    };
  }, [exerciseId]);

  if (!found) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Exercise not found.</Text>
      </View>
    );
  }
  const { exercise } = found;
  const runnable = exercise.language === 'typescript';

  const onChange = (text: string) => {
    setCode(text);
    saveCode(exerciseId, text);
  };

  const runChecks = async () => {
    setRunning(true);
    try {
      const result = await evaluateExerciseAsync(exercise, code);
      setEvaluation(result);
      onExerciseAttempt(exercise.id, exercise.concepts, result.allPassed);
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setCode(exercise.starterCode);
    saveCode(exerciseId, exercise.starterCode);
    setEvaluation(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.prompt}>{exercise.prompt}</Text>
          <View style={styles.tagRow}>
            <Badge text={exercise.language === 'go' ? 'Go' : 'TypeScript'} />
            {exercise.concepts.map((c) => (
              <Badge key={c} text={c.replace(/^(ts|go)-/, '')} />
            ))}
          </View>
        </Card>

        <CodeEditor value={code} onChangeText={onChange} language={exercise.language} />

        <View style={styles.buttonRow}>
          <Button
            title={runnable ? 'Run & Check' : 'Check'}
            onPress={runChecks}
            loading={running}
            style={styles.flexBtn}
          />
          <Button title="Reset" variant="ghost" onPress={reset} style={styles.flexBtn} />
        </View>

        {!runnable && (
          <Card>
            <Text style={styles.sectionLabel}>Expected output</Text>
            <Text style={styles.output}>{exercise.expectedOutput ?? '(see checks below)'}</Text>
            <Text style={styles.noteText}>
              Go runs on a server, not on your phone — so we verify your code by checking its
              structure. Compare your logic against the expected output above.
            </Text>
          </Card>
        )}

        {evaluation && (
          <Card
            style={{
              borderColor: evaluation.allPassed ? theme.colors.success : theme.colors.border,
            }}
          >
            <Text
              style={[
                styles.resultHeader,
                { color: evaluation.allPassed ? theme.colors.success : theme.colors.warning },
              ]}
            >
              {evaluation.allPassed ? '✓ All checks passed!' : 'Keep going…'}
            </Text>

            {runnable && evaluation.run.executed && (
              <>
                <Text style={styles.sectionLabel}>Output</Text>
                <Text style={styles.output}>
                  {evaluation.run.output || '(no console output)'}
                </Text>
                {evaluation.run.error && (
                  <Text style={styles.errorText}>⚠ {evaluation.run.error}</Text>
                )}
              </>
            )}

            <Text style={styles.sectionLabel}>Checks</Text>
            {evaluation.checks.map((c, i) => (
              <View key={i} style={styles.checkRow}>
                <Text style={[styles.checkIcon, { color: c.passed ? theme.colors.success : theme.colors.danger }]}>
                  {c.passed ? '✓' : '✗'}
                </Text>
                <View style={styles.checkBody}>
                  <Text style={styles.checkDesc}>{c.description}</Text>
                  {!c.passed && c.detail && <Text style={styles.checkDetail}>{c.detail}</Text>}
                </View>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.helpRow}>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => setHintsShown((n) => Math.min(n + 1, exercise.hints.length))}
            disabled={hintsShown >= exercise.hints.length}
          >
            <Text style={styles.helpText}>
              💡 Hint ({hintsShown}/{exercise.hints.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpBtn} onPress={() => setShowSolution((s) => !s)}>
            <Text style={styles.helpText}>{showSolution ? 'Hide solution' : '👁 Solution'}</Text>
          </TouchableOpacity>
        </View>

        {exercise.hints.slice(0, hintsShown).map((h, i) => (
          <Card key={i} style={styles.hintCard}>
            <Text style={styles.hintText}>
              {i + 1}. {h.text}
            </Text>
          </Card>
        ))}

        {showSolution && (
          <Card>
            <Text style={styles.sectionLabel}>Reference solution</Text>
            <Text style={styles.output}>{exercise.solution}</Text>
            <Button
              title="Load solution into editor"
              variant="secondary"
              onPress={() => onChange(exercise.solution)}
              style={{ marginTop: theme.spacing(1) }}
            />
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(8) },
  prompt: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  buttonRow: { flexDirection: 'row', gap: theme.spacing(1.5), marginVertical: theme.spacing(1.5) },
  flexBtn: { flex: 1 },
  resultHeader: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  sectionLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  output: {
    fontFamily: theme.mono,
    fontSize: 13,
    color: theme.colors.text,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 10,
  },
  noteText: { color: theme.colors.textDim, fontSize: 12, marginTop: 8, lineHeight: 18 },
  errorText: { color: theme.colors.danger, fontSize: 13, marginTop: 6, fontFamily: theme.mono },
  checkRow: { flexDirection: 'row', marginTop: 8 },
  checkIcon: { fontSize: 16, fontWeight: '800', marginRight: 8, width: 16 },
  checkBody: { flex: 1 },
  checkDesc: { color: theme.colors.text, fontSize: 14 },
  checkDetail: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontFamily: theme.mono,
    marginTop: 4,
    backgroundColor: theme.colors.bg,
    padding: 8,
    borderRadius: 6,
  },
  helpRow: { flexDirection: 'row', gap: theme.spacing(1.5), marginTop: theme.spacing(1) },
  helpBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingVertical: 10,
    alignItems: 'center',
  },
  helpText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  hintCard: { backgroundColor: theme.colors.surfaceAlt },
  hintText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  missing: { color: theme.colors.textDim, padding: theme.spacing(3) },
});
