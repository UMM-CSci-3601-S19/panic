import {Message} from "../message/message";

export interface Chat {
  _id: string;
  total_messages: number;
  messages: [Message];
}
