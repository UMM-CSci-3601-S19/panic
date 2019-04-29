import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageComponent } from './message.component';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageComponent ]
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

    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;

    component.message = {
      from: testUser,
      body: "",
      sent: new Date("")
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
