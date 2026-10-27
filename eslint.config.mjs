import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config({ignores:['**/generated.ts','dist/**','node_modules/**']},js.configs.recommended,...ts.configs.recommended,{files:['**/*.mjs'],languageOptions:{globals:{process:'readonly',console:'readonly',fetch:'readonly',URL:'readonly',setTimeout:'readonly',clearTimeout:'readonly',Buffer:'readonly',AbortSignal:'readonly'}}});
