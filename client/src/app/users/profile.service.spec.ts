
import {TestBed} from "@angular/core/testing";
import {ProfileService} from "./profile.service";
import {ProfileComponent} from "./profile.component";

describe('Profile Service',() => {

  let profileService: ProfileService;
  let profileComponentStub;

  beforeEach(() => {
    profileService = new ProfileService();

    profileComponentStub = {
      profile: {},
      profileId: ''
    };

    TestBed.configureTestingModule({
      imports: [],
      declarations: [ProfileComponent],
      providers: [{provide: ProfileComponent, useValue: profileComponentStub}]
    });
  });

  it('is initialized without a listener', () => {
    expect(profileService.hasListener()).toBeFalsy();
  });

  it('has a listener if we add one', () => {
    profileService.addListener(profileComponentStub);
    expect(profileService.hasListener()).toBeTruthy();
  });

  it('remove listener removes a listener', () => {
    profileService.addListener(profileComponentStub);
    expect(profileService.hasListener()).toBeTruthy();
    profileService.removeListener();
    expect(profileService.hasListener()).toBeFalsy();
  });

});
