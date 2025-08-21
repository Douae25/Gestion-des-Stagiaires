
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rh-stages-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rh-stages-details.component.html',
  styleUrls: ['./rh-stages-details.component.scss']
})
export class RhStagesDetailsComponent implements OnInit {
  stage: any = null;
  loading = true;
  showModal = false;
  selectedCommentaires: any[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.authService.getToken();
    fetch('/api/candidatures/en-cours/mes', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        this.stage = data.find((s: any) => s.candidature.id == id);
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  getStarCount(): number {
    if (!this.stage || !this.stage.evaluation) return 0;
    // Si la note est sur 5, retourne la note directement
    // Si la note est sur 20, convertit en étoiles sur 5
    const note = this.stage.evaluation.note;
    if (note <= 5) return note;
    return Math.ceil(note / 4);
  }

  goBack() {
    this.location.back();
  }

  openModal(rapport?: any) {
    // Charger dynamiquement les commentaires du rapport sélectionné
    if (rapport && this.stage && this.stage.commentaires) {
      this.selectedCommentaires = this.stage.commentaires.filter((c: any) => c.idRapport === rapport.id);
    } else {
      this.selectedCommentaires = [];
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
