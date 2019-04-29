import { Component, OnInit } from '@angular/core';
import {ChatService} from "./chat-service";

import {FormControl, FormGroup} from "@angular/forms";
import {Message} from "../message/message";
import {User} from "../users/user";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: []
})
export class ChatComponent implements OnInit {

  // feedId is set in the ride-list component when the chat dialog is opened.
  public feedId: string;
  public messages: Message[];

  public loggedInUser: User = JSON.parse(localStorage.user);

  public messageToSend: Message;
  public sendMessageForm = new FormGroup({
    messageToSend: new FormControl()
  });

  constructor(public chatService: ChatService) {
    this.messageToSend = {
      from: this.loggedInUser,
      body: "",
      sent: ChatComponent.currentDate(),
    };
  }

  public sendMessage() {
    if (this.messageToSend.body.length > 0) {
      console.log("Sending message to chat: " + this.feedId);

      this.messageToSend.sent = ChatComponent.currentDate();
      this.chatService.sendMessage(this.messageToSend, this.feedId);
      this.messageToSend.body = "";
      this.getMessages();
      this.getMessages();
    }
  }

  public getMessages() {
    console.log("Getting messages for chat: " + this.feedId);

    this.chatService.getMessages(this.feedId).then(feedData => {
      this.messages = [];
      let i;
      for (i = 0; i < feedData.length; i++) {
        this.messages.push(JSON.parse(feedData[i]['object']));
      }
      this.messages.reverse();
    });
  }

  deleteChat() {
    this.chatService.deleteChat(this.feedId);
    this.getMessages();
    this.getMessages();
  }

  ngOnInit() {
    this.getMessages();
  }

  private static currentDate(): Date {
    return new Date(Date.now());
  }

}
