import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CodeEditor } from '../components/CodeEditor';
import { Button, Card } from '../components/ui';
import { LanguageId } from '../content/types';
import { runJsAsync } from '../engine/runner';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Playground'>;

const SAMPLES: Record<LanguageId, string> = {
  typescript: `// A free TypeScript scratchpad. Edit and Run.\ntype Person = { name: string; age: number };\n\nconst people: Person[] = [\n  { name: "Ada", age: 36 },\n  { name: "Linus", age: 54 },\n];\n\nconst names = people\n  .filter((p) => p.age > 40)\n  .map((p) => p.name);\n\nconsole.log("Over 40:", names.join(", "));\n`,
  go: `// Go scratchpad (reference only — Go can't run on-device).\npackage main\n\nimport "fmt"\n\nfunc main() {\n\tnums := []int{2, 4, 6}\n\tsum := 0\n\tfor _, n := range nums {\n\t\tsum += n\n\t}\n\tfmt.Println("sum:", sum)\n}\n`,
};

export const PlaygroundScreen: React.FC<Props> = ({ navigation, route }) => {
  const [language, setLanguage] = useState<LanguageId>(route.params?.language ?? 'typescript');
  const [code, setCode] = useState(SAMPLES[route.params?.language ?? 'typescript']);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Playground' });
  }, [navigation]);

  const switchLanguage = (lang: LanguageId) => {
    setLanguage(lang);
    setCode(SAMPLES[lang]);
    setOutput(null);
    setError(null);
  };

  const run = async () => {
    if (language !== 'typescript') {
      setError(null);
      setOutput(
        'Go executes on a server, so it cannot run inside this offline app.\n' +
          'Use the TypeScript playground to run code live, or study the Go lessons & reference.',
      );
      return;
    }
    const result = await runJsAsync(code);
    setOutput(result.output || '(no output)');
    setError(result.error);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.tabs}>
          {(['typescript', 'go'] as LanguageId[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => switchLanguage(lang)}
              style={[styles.tab, language === lang && styles.tabActive]}
            >
              <Text style={[styles.tabText, language === lang && styles.tabTextActive]}>
                {lang === 'typescript' ? 'TypeScript' : 'Go'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CodeEditor value={code} onChangeText={setCode} language={language} />

        <Button title="Run" onPress={run} style={{ marginVertical: theme.spacing(1.5) }} />

        {(output != null || error) && (
          <Card>
            <Text style={styles.outLabel}>Console</Text>
            {output != null && <Text style={styles.output}>{output}</Text>}
            {error && <Text style={styles.error}>⚠ {error}</Text>}
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(8) },
  tabs: { flexDirection: 'row', marginBottom: theme.spacing(1.5), gap: theme.spacing(1) },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.accent },
  tabText: { color: theme.colors.textDim, fontWeight: '600' },
  tabTextActive: { color: theme.colors.text },
  outLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  output: { fontFamily: theme.mono, fontSize: 13, color: theme.colors.text, lineHeight: 19 },
  error: { color: theme.colors.danger, fontFamily: theme.mono, fontSize: 13, marginTop: 8 },
});
