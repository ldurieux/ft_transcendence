import { z } from 'zod';
import { stopPaddleSchema, movePaddleSchema } from '../validationPipe/game.schema';

export type MovePaddle = z.infer<typeof movePaddleSchema>;
export type StopPaddle = z.infer<typeof stopPaddleSchema>;