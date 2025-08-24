import { Injectable } from '@angular/core';

export interface AdminAction {
  type: 'offre' | 'utilisateur';
  action: 'Activée' | 'Archivée';
  cible: string;
  date: string; // format ISO
}

@Injectable({ providedIn: 'root' })
export class AdminActionService {
  private readonly STORAGE_KEY = 'admin_actions';

  addAction(action: AdminAction) {
    const actions = this.getActions();
    actions.unshift(action); // Ajoute en début
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actions.slice(0, 10)));
  }

  getActions(): AdminAction[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  clearActions() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
