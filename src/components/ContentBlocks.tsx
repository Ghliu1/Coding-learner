// Renders lesson/resource ContentBlock[] into native views, including
// syntax-highlighted code blocks.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ContentBlock } from '../content/types';
import { theme } from '../theme/theme';
import { tokenize } from './highlight';

const calloutColor: Record<string, string> = {
  info: theme.colors.accent,
  tip: theme.colors.success,
  warning: theme.colors.warning,
  pitfall: theme.colors.danger,
};

const calloutLabel: Record<string, string> = {
  info: 'Note',
  tip: 'Tip',
  warning: 'Watch out',
  pitfall: 'Common pitfall',
};

export const CodeBlock: React.FC<{ code: string; language: string; caption?: string }> = ({
  code,
  language,
  caption,
}) => {
  const spans =
    language === 'typescript' || language === 'go'
      ? tokenize(code, language)
      : [{ text: code, color: theme.colors.text }];
  return (
    <View style={styles.codeWrap}>
      <Text style={styles.code} selectable>
        {spans.map((s, i) => (
          <Text key={i} style={{ color: s.color }}>
            {s.text}
          </Text>
        ))}
      </Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
};

export const InlineMarkup: React.FC<{ text: string; style?: object }> = ({ text, style }) => {
  // Supports `code`, **bold**, and *italic* inline spans.
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <Text style={[styles.paragraph, style]}>
      {parts.map((p, i) => {
        if (p.startsWith('`') && p.endsWith('`')) {
          return (
            <Text key={i} style={styles.inlineCode}>
              {p.slice(1, -1)}
            </Text>
          );
        }
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <Text key={i} style={styles.bold}>
              {p.slice(2, -2)}
            </Text>
          );
        }
        if (p.startsWith('*') && p.endsWith('*')) {
          return (
            <Text key={i} style={styles.italic}>
              {p.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{p}</Text>;
      })}
    </Text>
  );
};

export const ContentBlocks: React.FC<{ blocks: ContentBlock[] }> = ({ blocks }) => {
  return (
    <View>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'heading':
            return (
              <Text key={i} style={styles.heading}>
                {block.text}
              </Text>
            );
          case 'paragraph':
            return <InlineMarkup key={i} text={block.text} />;
          case 'code':
            return (
              <CodeBlock key={i} code={block.code} language={block.language} caption={block.caption} />
            );
          case 'callout':
            return (
              <View
                key={i}
                style={[styles.callout, { borderLeftColor: calloutColor[block.tone] }]}
              >
                <Text style={[styles.calloutTitle, { color: calloutColor[block.tone] }]}>
                  {block.title ?? calloutLabel[block.tone]}
                </Text>
                <InlineMarkup text={block.text} style={styles.calloutText} />
              </View>
            );
          case 'list':
            return (
              <View key={i} style={styles.list}>
                {block.items.map((item, j) => (
                  <View key={j} style={styles.listItem}>
                    <Text style={styles.bullet}>{block.ordered ? `${j + 1}.` : '•'}</Text>
                    <InlineMarkup text={item} style={styles.listText} />
                  </View>
                ))}
              </View>
            );
          case 'table':
            return (
              <View key={i} style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {block.headers.map((h, j) => (
                    <Text key={j} style={[styles.tableCell, styles.tableHeaderCell]}>
                      {h}
                    </Text>
                  ))}
                </View>
                {block.rows.map((row, r) => (
                  <View key={r} style={styles.tableRow}>
                    {row.map((cell, c) => (
                      <Text key={c} style={styles.tableCell}>
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  paragraph: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: theme.spacing(1.5),
  },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  inlineCode: {
    fontFamily: theme.mono,
    fontSize: 13.5,
    color: theme.colors.synBuiltin,
    backgroundColor: theme.colors.surfaceAlt,
  },
  codeWrap: {
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  code: { fontFamily: theme.mono, fontSize: 13, lineHeight: 19 },
  caption: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  callout: {
    backgroundColor: theme.colors.surfaceAlt,
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  calloutTitle: { fontWeight: '700', fontSize: 13, marginBottom: 4 },
  calloutText: { marginBottom: 0, fontSize: 14 },
  list: { marginBottom: theme.spacing(1.5) },
  listItem: { flexDirection: 'row', marginBottom: 6, paddingRight: 8 },
  bullet: { color: theme.colors.accent, marginRight: 8, fontSize: 15, lineHeight: 23 },
  listText: { flex: 1, marginBottom: 0 },
  table: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    marginBottom: theme.spacing(1.5),
    overflow: 'hidden',
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tableHeader: { backgroundColor: theme.colors.surfaceAlt },
  tableCell: {
    flex: 1,
    padding: 8,
    color: theme.colors.text,
    fontSize: 13,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  tableHeaderCell: { fontWeight: '700' },
});
