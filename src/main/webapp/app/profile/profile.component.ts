import { Component, OnInit, signal } from '@angular/core';
import { FileUploadModule, FileUploadEvent } from 'primeng/fileupload';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { AccordionModule } from 'primeng/accordion';
import { NgIf, CommonModule } from '@angular/common';
import { UserService } from '../entities/user/service/user.service';
import { IUser } from 'app/entities/user/user.model';
import { Observable } from 'rxjs';
import { ProfilePictureService } from 'app/service/profilepictureservice.service';
import { KeycloakService } from '../service/keycloak.service';

@Component({
  selector: 'jhi-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: true,
  imports: [AccordionModule, FileUploadModule, HttpClientModule, TextareaModule, FormsModule, NgIf, CommonModule],
})
export class ProfileComponent implements OnInit {
  account = signal<Account | null>(null);
  uploadedFiles: any[] = [];
  displayUrl!: string;
  user!: IUser;
  headers: HttpHeaders = new HttpHeaders();
  bio: string = '';

  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private profilePictureService: ProfilePictureService,
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  onBioChange(event: Event): void {
    const bioValue = (event.target as HTMLTextAreaElement).value;
    this.bio = bioValue;
    this.userService.updateUserBio(bioValue);
  }

  async onUpload(event: any): Promise<void> {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
      (await this.profilePictureService.uploadProfilePicture(file, this.headers)).subscribe(
        (response: any) => {
          const imageUrl = response.url;
          this.account()!.imageUrl = imageUrl;
          this.updateKeycloakUserProfile(imageUrl);
        },
        (error: any) => console.error('Error uploading file', error),
      );
    }
  }

  private async initializeComponent(): Promise<void> {
    try {
      const account = await this.accountService.identity().toPromise();
      this.account.set(account!);

      const userResponse = await this.userService.getLoggedInUser().toPromise();
      this.user = userResponse!.body!;
      if (this.user.bio) {
        this.bio = this.user.bio ?? '';
      }

      const profilePictureUrl = await this.profilePictureService.getProfilePictureUrl(this.user.id).toPromise();
      this.displayUrl = profilePictureUrl;
    } catch (error) {
      console.error('Error initializing component', error);
    }
  }

  private updateKeycloakUserProfile(imageUrl: string): void {
    this.userService.updateUserProfilePicture(this.user.id, imageUrl).subscribe(
      () => console.log('Keycloak user profile updated successfully'),
      error => console.error('Error updating Keycloak user profile', error),
    );
  }
}
