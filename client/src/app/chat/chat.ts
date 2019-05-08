import {Message} from "./message";

export interface Chat {
  _id: string;
  total_messages: number;
  messages: [Message];
}
