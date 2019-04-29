import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';
import {MessageComponent} from "../message/message.component";
import {CustomModule} from "../custom.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ChatService} from "./chat-service";
import {MockChatService} from "./mock-chat-service";

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ CustomModule, HttpClientTestingModule ],
      declarations: [ ChatComponent, MessageComponent ],
      providers: [ {provide: ChatService, useClass: MockChatService} ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const testUser = {
      _id: "",
      name: "Test User",
      phone: "000-000-0000",
      email: "test@example.com",
    };
    localStorage.setItem("user", JSON.stringify(testUser));

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
