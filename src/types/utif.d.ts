declare module "utif" {
  export interface UTIFIFD {
    width: number;
    height: number;
    [key: string]: any;
  }
  export function decode(buffer: ArrayBuffer | Uint8Array): UTIFIFD[];
  export function decodeImage(
    buffer: ArrayBuffer | Uint8Array,
    ifd: UTIFIFD,
    ifds?: UTIFIFD[],
  ): void;
  export function toRGBA8(ifd: UTIFIFD): Uint8Array;
  const UTIF: {
    decode: typeof decode;
    decodeImage: typeof decodeImage;
    toRGBA8: typeof toRGBA8;
  };
  export default UTIF;
}
