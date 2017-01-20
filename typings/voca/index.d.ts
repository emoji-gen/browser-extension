// Type definitions for Voca v1.2.0
// Project: https://vocajs.com/
// Definitions by: Pine Mizune <https://github.com/pine>

declare namespace Voca {
  interface VocaStatic {
    trim(subject?: string, whitespace?: string) : string;
  }
}

declare var v: Voca.VocaStatic;

declare module "voca" {
  export = v;
}
