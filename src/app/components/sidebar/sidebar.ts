import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

interface SidebarItem {
  label: string;
  fragment: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly menuItems = signal<SidebarItem[]>([
    { label: 'Cartera', fragment: 'cartera', icon: 'CA' },
    { label: 'Mercado', fragment: 'mercado', icon: 'ME' },
    { label: 'Operaciones', fragment: 'operaciones', icon: 'OP' },
    { label: 'Alertas', fragment: 'alertas', icon: 'AL' },
    { label: 'Ranking', fragment: 'ranking', icon: 'RA' },
    { label: 'Configuracion', fragment: 'configuracion', icon: 'CO' },
  ]);
}
