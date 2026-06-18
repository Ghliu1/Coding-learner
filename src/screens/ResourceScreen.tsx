import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCourse } from '../content';
import { ContentBlocks } from '../components/ContentBlocks';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Resource'>;

export const ResourceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { language, resourceId } = route.params;
  const resource = getCourse(language).resources.find((r) => r.id === resourceId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: resource?.title ?? 'Resource' });
  }, [navigation, resource?.title]);

  if (!resource) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Resource not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{resource.title}</Text>
      <ContentBlocks blocks={resource.body} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800', marginBottom: theme.spacing(1) },
  missing: { color: theme.colors.textDim, padding: theme.spacing(3) },
});
