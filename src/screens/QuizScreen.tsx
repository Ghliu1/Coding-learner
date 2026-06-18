import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { allQuiz, findLesson } from '../content';
import { CodeBlock } from '../components/ContentBlocks';
import { Button, Card, ProgressBar } from '../components/ui';
import { QuizQuestion } from '../content/types';
import { useProgress } from '../state/ProgressContext';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const { language, lessonId } = route.params;
  const { onQuizAnswer } = useProgress();

  const questions: QuizQuestion[] = useMemo(() => {
    if (lessonId) return findLesson(language, lessonId)?.quiz ?? [];
    return allQuiz(language);
  }, [language, lessonId]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: lessonId ? 'Lesson Quiz' : 'Mixed Quiz' });
  }, [navigation, lessonId]);

  if (questions.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>No questions available.</Text>
      </View>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.bigScore}>{pct}%</Text>
        <Text style={styles.scoreLabel}>
          {correctCount} / {questions.length} correct
        </Text>
        <Text style={styles.feedback}>
          {pct === 100
            ? '🎉 Perfect! You have mastered this material.'
            : pct >= 70
              ? '👍 Solid work. Review the ones you missed.'
              : '📘 Keep practicing — revisit the lesson and try again.'}
        </Text>
        <Button title="Done" onPress={() => navigation.goBack()} style={{ marginTop: 24, minWidth: 160 }} />
      </View>
    );
  }

  const q = questions[index];
  const answered = selected !== null;

  const choose = (i: number) => {
    if (answered) return;
    setSelected(i);
    const correct = i === q.answerIndex;
    if (correct) setCorrectCount((c) => c + 1);
    onQuizAnswer(q.id, q.concepts, correct);
  };

  const nextQuestion = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((n) => n + 1);
      setSelected(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ProgressBar percent={((index + 1) / questions.length) * 100} color={theme.colors.accent} />
      <Text style={styles.counter}>
        Question {index + 1} of {questions.length}
      </Text>

      <Card>
        <Text style={styles.question}>{q.prompt}</Text>
        {q.code && <CodeBlock code={q.code.code} language={q.code.language} />}
      </Card>

      {q.options.map((opt, i) => {
        const isCorrect = i === q.answerIndex;
        const isChosen = i === selected;
        let borderColor: string = theme.colors.border;
        let bg: string = theme.colors.surface;
        if (answered) {
          if (isCorrect) {
            borderColor = theme.colors.success;
            bg = '#10301c';
          } else if (isChosen) {
            borderColor = theme.colors.danger;
            bg = '#3a1517';
          }
        }
        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.85}
            disabled={answered}
            onPress={() => choose(i)}
            style={[styles.option, { borderColor, backgroundColor: bg }]}
          >
            <Text style={styles.optionLabel}>{String.fromCharCode(65 + i)}.</Text>
            <Text style={styles.optionText}>{opt}</Text>
            {answered && isCorrect && <Text style={styles.optMark}>✓</Text>}
            {answered && isChosen && !isCorrect && <Text style={styles.optMarkBad}>✗</Text>}
          </TouchableOpacity>
        );
      })}

      {answered && (
        <Card style={styles.explainCard}>
          <Text style={styles.explainLabel}>
            {selected === q.answerIndex ? 'Correct!' : 'Explanation'}
          </Text>
          <Text style={styles.explainText}>{q.explanation}</Text>
        </Card>
      )}

      {answered && (
        <Button
          title={index + 1 >= questions.length ? 'See results' : 'Next question'}
          onPress={nextQuestion}
          style={{ marginTop: theme.spacing(1) }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  center: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing(3) },
  counter: { color: theme.colors.textDim, fontSize: 13, marginTop: 8, marginBottom: theme.spacing(1.5) },
  question: { color: theme.colors.text, fontSize: 17, fontWeight: '600', lineHeight: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius,
    padding: theme.spacing(1.75),
    marginBottom: theme.spacing(1),
  },
  optionLabel: { color: theme.colors.accent, fontWeight: '800', marginRight: 10, fontSize: 15 },
  optionText: { color: theme.colors.text, fontSize: 15, flex: 1, lineHeight: 21 },
  optMark: { color: theme.colors.success, fontSize: 18, fontWeight: '800' },
  optMarkBad: { color: theme.colors.danger, fontSize: 18, fontWeight: '800' },
  explainCard: { backgroundColor: theme.colors.surfaceAlt, marginTop: theme.spacing(1) },
  explainLabel: { color: theme.colors.accent, fontWeight: '700', marginBottom: 4 },
  explainText: { color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  bigScore: { color: theme.colors.text, fontSize: 56, fontWeight: '800' },
  scoreLabel: { color: theme.colors.textDim, fontSize: 16, marginTop: 4 },
  feedback: { color: theme.colors.text, fontSize: 15, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  missing: { color: theme.colors.textDim, padding: theme.spacing(3) },
});
