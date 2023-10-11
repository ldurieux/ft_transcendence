import { z } from "zod";

export const gameIdSchema = z
.number()
.positive()
.finite()
.safe()

export const playerSchema = z
.number()
.positive()
.finite()
.safe()

export const directionSchema = z
.number()
.finite()
.safe()

export const movePaddleSchema = z
.object({
    gameId: gameIdSchema,
    player: playerSchema,
    direction: directionSchema
})

export const stopPaddleSchema = z
.object({
    gameId: gameIdSchema,
    player: playerSchema
})