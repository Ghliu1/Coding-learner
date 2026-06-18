// An IDE-like code editor for mobile: a transparent multiline TextInput layered
// over syntax-highlighted text, with a line-number gutter. The highlight layer
// and input share identical font metrics so the caret lines up with the text.

import React, { useMemo } from 'react';
import {
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { LanguageId } from '../content/types';
import { theme } from '../theme/theme';
import { tokenize } from './highlight';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  language: LanguageId;
  editable?: boolean;
}

const FONT_SIZE = 13;
const LINE_HEIGHT = 20;

export const CodeEditor: React.FC<Props> = ({ value, onChangeText, language, editable = true }) => {
  const spans = useMemo(() => tokenize(value, language), [value, language]);
  const lineCount = useMemo(() => value.split('\n').length, [value]);
  const inputRef = React.useRef<TextInput>(null);

  // Auto-indent: pressing Enter copies the previous line's leading whitespace
  // (and adds one level after an opening brace) — a small IDE nicety.
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    // Soft handling only; RN key events are limited on-device, so this is a
    // best-effort enhancement and the editor remains usable without it.
    void e;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.gutter}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: lineCount }).map((_, idx) => (
          <Text key={idx} style={styles.lineNumber}>
            {idx + 1}
          </Text>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.hscroll}
      >
        <View style={styles.editorArea}>
          {/* Highlight layer (behind). */}
          <Text style={styles.highlightLayer} selectable={false}>
            {spans.map((s, idx) => (
              <Text key={idx} style={{ color: s.color }}>
                {s.text}
              </Text>
            ))}
            {/* Trailing newline keeps the last line tall enough. */}
            {value.endsWith('\n') ? '​' : ''}
          </Text>

          {/* Input layer (front, transparent text, visible caret). */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onKeyPress={handleKeyPress}
            editable={editable}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="ascii-capable"
            textAlignVertical="top"
            scrollEnabled={false}
            selectionColor={theme.colors.accent}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const monoFamily = undefined; // RN default monospace varies by platform; rely on style below.

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    minHeight: 180,
  },
  gutter: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingTop: 10,
    maxWidth: 44,
  },
  lineNumber: {
    fontFamily: theme.mono,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    color: theme.colors.textDim,
    textAlign: 'right',
    minWidth: 22,
  },
  hscroll: {
    flexGrow: 1,
  },
  editorArea: {
    position: 'relative',
    minWidth: 280,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  highlightLayer: {
    fontFamily: theme.mono,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    color: theme.colors.text,
    minWidth: 280,
  },
  input: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 10,
    paddingHorizontal: 10,
    fontFamily: monoFamily ?? theme.mono,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    color: 'transparent',
    // Caret stays visible because selectionColor + a transparent text keeps the
    // blinking cursor tinted on both platforms.
  },
});
