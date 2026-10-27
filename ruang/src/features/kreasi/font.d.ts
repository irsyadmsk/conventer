import type { CreationProject, Glyph } from './types';
export type FontMapping = { source: string; codepoint: number; character: string };
export type FontResult = { buffer: ArrayBuffer; mapping: FontMapping[] };
export function build(project: CreationProject): FontResult;
export function previewText(text: string, glyphs: Glyph[], mapping: FontMapping[]): string;
