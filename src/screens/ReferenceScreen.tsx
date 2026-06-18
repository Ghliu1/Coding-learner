import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCourse } from '../content';
import { CodeBlock } from '../components/ContentBlocks';
import { Card } from '../components/ui';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Reference'>;
type Tab = 'errors' | 'libraries';

export const ReferenceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { language } = route.params;
  const course = getCourse(language);
  const [tab, setTab] = useState<Tab>('errors');

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${course.name} Reference` });
  }, [navigation, course.name]);

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        <TabButton label="Syntax Errors" active={tab === 'errors'} onPress={() => setTab('errors')} />
        <TabButton label="Libraries" active={tab === 'libraries'} onPress={() => setTab('libraries')} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'errors' && (
          <>
            <Text style={styles.intro}>
              Common errors you'll hit, what causes them, and how to fix them.
            </Text>
            {course.commonErrors.map((err) => (
              <Card key={err.id}>
                <Text style={styles.errMsg}>{err.message}</Text>
                <Text style={styles.fieldLabel}>Why</Text>
                <Text style={styles.fieldText}>{err.cause}</Text>
                <Text style={styles.fieldLabel}>Fix</Text>
                <Text style={styles.fieldText}>{err.fix}</Text>
                <Text style={[styles.fieldLabel, { color: theme.colors.danger }]}>✗ Wrong</Text>
                <CodeBlock code={err.example.bad} language={err.example.language} />
                <Text style={[styles.fieldLabel, { color: theme.colors.success }]}>✓ Right</Text>
                <CodeBlock code={err.example.good} language={err.example.language} />
              </Card>
            ))}
          </>
        )}

        {tab === 'libraries' && (
          <>
            <Text style={styles.intro}>
              Common libraries and standard-library APIs with real-world usage.
            </Text>
            {course.libraries.map((lib) => (
              <Card key={lib.id}>
                <Text style={styles.libName}>{lib.name}</Text>
                <Text style={styles.libPath}>{lib.importPath}</Text>
                <Text style={styles.fieldText}>{lib.description}</Text>
                {lib.examples.map((ex, i) => (
                  <View key={i} style={styles.example}>
                    <Text style={styles.exTitle}>{ex.title}</Text>
                    <CodeBlock code={ex.code} language={language} />
                    <Text style={styles.exExplain}>{ex.explanation}</Text>
                  </View>
                ))}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const TabButton: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  tabs: { flexDirection: 'row', padding: theme.spacing(2), paddingBottom: 0, gap: theme.spacing(1) },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.accent },
  tabText: { color: theme.colors.textDim, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: theme.colors.text },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  intro: { color: theme.colors.textDim, fontSize: 13, marginBottom: theme.spacing(1.5) },
  errMsg: {
    color: theme.colors.danger,
    fontFamily: theme.mono,
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  fieldLabel: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 3,
  },
  fieldText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  libName: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  libPath: { color: theme.colors.synBuiltin, fontFamily: theme.mono, fontSize: 12, marginBottom: 8 },
  example: { marginTop: theme.spacing(1.5) },
  exTitle: { color: theme.colors.accent, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  exExplain: { color: theme.colors.textDim, fontSize: 13, lineHeight: 19, marginTop: 2 },
});
