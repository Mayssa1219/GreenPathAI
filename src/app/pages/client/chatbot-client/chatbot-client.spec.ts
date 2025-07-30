import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotClient } from './chatbot-client';

describe('ChatbotClient', () => {
  let component: ChatbotClient;
  let fixture: ComponentFixture<ChatbotClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
