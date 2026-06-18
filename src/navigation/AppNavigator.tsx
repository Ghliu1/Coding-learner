import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { theme } from '../theme/theme';
import { CourseScreen } from '../screens/CourseScreen';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { PlaygroundScreen } from '../screens/PlaygroundScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ReferenceScreen } from '../screens/ReferenceScreen';
import { ResourceScreen } from '../screens/ResourceScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.accent,
  },
};

export const AppNavigator: React.FC = () => (
  <NavigationContainer theme={navTheme}>
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Coding Learner' }} />
      <Stack.Screen name="Course" component={CourseScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Playground" component={PlaygroundScreen} />
      <Stack.Screen name="Reference" component={ReferenceScreen} />
      <Stack.Screen name="Resource" component={ResourceScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
