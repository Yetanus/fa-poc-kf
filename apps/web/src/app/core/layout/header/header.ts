import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggle } from '../../theme/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ThemeToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly links = [
    { path: '/feed', label: 'Wiadomości' },
    { path: '/about', label: 'O projekcie' },
  ];
}
