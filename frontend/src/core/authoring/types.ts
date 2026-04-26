export type AuthoringCommand =
  | { type: 'INSERT_PARAGRAPH'; text: string }
  | { type: 'DELETE_PARAGRAPH'; id: string }
  | { type: 'FORMAT_TEXT'; format: string };
