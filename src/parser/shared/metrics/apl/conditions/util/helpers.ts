import { PandemicData } from './types';

// take the min between (the old remaining duration + the buff duration from the pandemicData)
//                  or  (the buff duration from the pandemicData + the pandemic cap, if pandemicCap 
//                      is undefined we just add 30% of the total buff)
export const buffDuration = (timeRemaining: number | undefined, pandemic: PandemicData): number =>
  Math.min(
    (timeRemaining || 0) + pandemic.duration,
    pandemic.duration + (pandemic.pandemicCap || pandemic.duration * 0.3),
  );
