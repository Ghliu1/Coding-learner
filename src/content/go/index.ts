import { Course } from '../types';
import { goBasics } from './m1-basics';
import { goFunctions } from './m2-functions';
import { goCollections } from './m3-collections';
import { goConcurrency } from './m4-concurrency';
import { goProjects } from './m5-projects';
import { goConcepts, goErrors, goLibraries, goResources } from './reference';

export const goCourse: Course = {
  language: 'go',
  name: 'Go',
  tagline: 'Simple, fast, and built for concurrency from the ground up.',
  description:
    'Learn Go from packages and variables to slices, structs, interfaces, and goroutines — the practical toolkit used to build real backend services, CLIs, and cloud tooling.',
  accent: '#00add8',
  modules: [goBasics, goFunctions, goCollections, goConcurrency, goProjects],
  concepts: goConcepts,
  resources: goResources,
  commonErrors: goErrors,
  libraries: goLibraries,
};
