import { createBackgroundNpcController } from './backgroundNpcController';
import { createBotProblemController } from './botProblemController';
import { createPressureModel } from './pressureModel';
import { createProblemResolver } from './problemResolver';
import { createSpawnDirector } from './spawnDirector';

export function createDefaultGameAlgorithms() {
  return {
    backgroundNpcs: createBackgroundNpcController(),
    spawning: createSpawnDirector(),
    mobileProblems: createBotProblemController(),
    resolution: createProblemResolver(),
    pressure: createPressureModel(),
  };
}
