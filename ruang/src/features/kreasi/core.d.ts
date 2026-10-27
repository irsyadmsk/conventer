import type { CipherConfig, CreationProject } from './types';
export function createProject(name?: string): CreationProject;
export function encode(text: string, cipher: CipherConfig): string;
export function decode(text: string, cipher: CipherConfig): string;
export function validateCipher(cipher: unknown): string[];
export function parseProject(text: string): CreationProject;
export function serializeProject(project: CreationProject): string;
