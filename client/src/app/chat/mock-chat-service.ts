import {Injectable} from '@angular/core';

@Injectable()
export class MockChatService {
  connectStream() {}
  getMessages(): Promise<any> {
    return new Promise(() => {
      return {};
    })
  }
}
