import {User} from "../users/user";

export interface Message {
  from: User;
  body: string;
  sent: Date;
}
