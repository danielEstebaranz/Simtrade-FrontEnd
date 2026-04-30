import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly menuItems = signal<SidebarItem[]>([
    { label: 'Cartera', href: '#cartera', icon: 'CA' },
    { label: 'Mercado', href: '#mercado', icon: 'ME' },
    { label: 'Operaciones', href: '#operaciones', icon: 'OP' },
    { label: 'Alertas', href: '#alertas', icon: 'OP' },
    { label: 'Ranking', href: '#ranking', icon: 'RA' },
    { label: 'Configuracion', href: '#configuracion', icon: 'CO' },
  ]);
}
