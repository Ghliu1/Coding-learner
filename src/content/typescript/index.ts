import { Course } from '../types';
import { tsFundamentals } from './m1-fundamentals';
import { tsFunctions } from './m2-functions';
import { tsObjects } from './m3-objects';
import { tsRealWorld } from './m4-realworld';
import { tsProjects } from './m5-projects';
import { tsConcepts, tsErrors, tsLibraries, tsResources } from './reference';

export const typescriptCourse: Course = {
  language: 'typescript',
  name: 'TypeScript',
  tagline: 'JavaScript that scales, with types that catch bugs early.',
  description:
    'Learn TypeScript from variables to async, building the type intuition used in real web, server, and mobile codebases.',
  accent: '#3178c6',
  modules: [tsFundamentals, tsFunctions, tsObjects, tsRealWorld, tsProjects],
  concepts: tsConcepts,
  resources: tsResources,
  commonErrors: tsErrors,
  libraries: tsLibraries,
};
