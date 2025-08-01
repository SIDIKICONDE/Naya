import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly reverseString: (input: string) => string;
  readonly countCharacters: (input: string) => number;
  readonly toUpperCase: (input: string) => string;
  readonly toLowerCase: (input: string) => string;
  readonly removeSpaces: (input: string) => string;
  readonly isPalindrome: (input: string) => boolean;
  readonly getRandomNumber: (min: number, max: number) => number;
  readonly calculateFactorial: (n: number) => number;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeModuleEQ');
