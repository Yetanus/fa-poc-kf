import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'feed' },
  {
    path: 'feed',
    title: 'Wiadomości',
    loadChildren: () => import('./features/feed/feed.routes'),
  },
  {
    path: 'article/:source/:id',
    title: 'Artykuł',
    loadComponent: () => import('./features/article/article-page').then((m) => m.ArticlePage),
  },
  {
    path: 'about',
    title: 'O projekcie',
    loadComponent: () => import('./features/about/about-page').then((m) => m.AboutPage),
  },
  {
    path: '**',
    title: 'Nie znaleziono strony',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
