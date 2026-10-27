import type { Glyph } from './types';
export type GlyphToken = { glyph: Glyph; text?: never } | { text: string; glyph?: never };
export function tokenize(text: string, glyphs: Glyph[]): GlyphToken[];
export function glyphSVG(glyph: Glyph, strokeWidth: number): string;
export function textSVG(text: string, glyphs: Glyph[], strokeWidth: number): string;
export function sheetSVG(glyphs: Glyph[], strokeWidth: number, title: string): string;
