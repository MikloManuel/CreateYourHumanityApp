import { Component, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { FriendrequestService } from 'app/entities/friendrequest/service/friendrequest.service';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import SharedModule from 'app/shared/shared.module';
import { loadRemoteModule } from '@angular-architects/module-federation';


interface UserWithAccount {
  user: IUser;
  account: Account;
}

@Component({
  standalone: true,
  selector: 'jhi-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [CommonModule, CardModule, ButtonModule, RouterModule, SharedModule],
})
export class UserListComponent implements OnInit {
  currentUser!: UserWithAccount;
  users$!: Observable<UserWithAccount[]>;
  account = signal<Account | null>(null);

  constructor(
    private router: Router,
    private accountService: AccountService,
    private userService: UserService,
    private friendrequestService: FriendrequestService,
  ) {}

  /**
   * Initializes the user list component by fetching the current user and all other users.
   * The current user is fetched from the authentication state and combined with the user service response.
   * All other users are fetched from the user service and filtered to exclude the  current user.
   * The combined user and account data is then stored in the component's `currentUser` and `users` properties.
   */
  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      this.account.set(account);
      this.userService.getLoggedInUser().subscribe(res => {
        if (res.body) {
          this.currentUser = { user: res.body, account: account! };
          this.users$ = this.loadUsers().pipe(map(users => users.filter(user => user.user.login !== this.currentUser.user.login)));
        }
      });
    });
  }


  sendFriendRequest(userId: string): void {
    this.userService.sendFriendRequest(userId, this.currentUser.user.id).subscribe(
      (res: HttpResponse<IUser>) => {
        console.log('Friend request sent successfully');
        this.friendrequestService.addFriendrequestToCollectionIfMissing([res.body!]);
      },
      () => {
        console.error('Failed to send friend request');
      },
    );
  }

  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  navigateToMindmapEditor(userId: string): void {
    this.router.navigate(['/mindmap-editor', userId]);
  }

  private loadUsers(): Observable<UserWithAccount[]> {
    return this.userService
      .getAllUsers()
      .pipe(
        switchMap(users =>
          forkJoin(users.map(user => this.accountService.getAccountDetails(user.login!).pipe(map(account => ({ user, account }))))),
        ),
      );
  }
}
