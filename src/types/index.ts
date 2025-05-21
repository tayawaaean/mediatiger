export interface Language {
  code: string;
  name: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}