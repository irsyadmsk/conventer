export type Point = [number, number];
export type Glyph = { id: string; source: string; strokes: Point[][] };
export type CipherConfig = {
  separator: '/' | '|' | '·' | ' ';
  unknown: 'keep' | 'reject';
  rules: { source: string; target: string }[];
};
export type CreationProject = {
  version: 1;
  id: string;
  name: string;
  updatedAt: string;
  cipher: CipherConfig;
  glyphs: Glyph[];
  font: {
    family: string;
    author: string;
    license: string;
    mapping: 'latin' | 'pua';
    strokeWidth: number;
    spacing: number;
  };
  sample: string;
};
export type ProjectState = { version: 1; activeId: string; projects: CreationProject[] };
