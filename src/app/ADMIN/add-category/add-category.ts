
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SnackbarService } from '../../shared/snackbar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  icon?: string;
  parent?: string;
}

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-category.html',
  styleUrls: ['./add-category.css'],
})
export class AddCategory implements OnInit {
  @Output() saved = new EventEmitter<any>();
  @Input() showAddButton = true;
  showModal = false;
  model = { name: '', icon: '', parent: '' };
  categories: Category[] = [];
  editingId: number | null = null;
  error = '';

  constructor(private snackbar: SnackbarService){}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(){
    try{
      const raw = localStorage.getItem('categories');
      this.categories = raw ? JSON.parse(raw) : [];
    }catch{
      this.categories = [];
    }
  }

  save(ev: Event){
    ev.preventDefault();
    this.error = '';
    const name = (this.model.name || '').trim();
    if(!name){
      this.error = 'Category name is required';
      return;
    }

    if (this.editingId) {
      // update existing
      const idx = this.categories.findIndex(c => c.id === this.editingId);
      if (idx > -1) {
        this.categories[idx] = {
          id: this.editingId,
          name,
          icon: (this.model.icon || '').trim(),
          parent: (this.model.parent || '').trim() || undefined
        };
        localStorage.setItem('categories', JSON.stringify(this.categories));
        try{ this.saved.emit({ action: 'updated', item: this.categories[idx] }); }catch{}
      }
      this.editingId = null;
      this.snackbar.show('Category updated', { type: 'success', duration: 2500 });
    } else {
      const cat: Category = {
        id: Date.now(),
        name,
        icon: (this.model.icon || '').trim(),
        parent: (this.model.parent || '').trim() || undefined
      };
      this.categories.unshift(cat);
      localStorage.setItem('categories', JSON.stringify(this.categories));
      try{ this.saved.emit(cat); }catch{}
      // show snackbar with undo
      const added = cat;
      this.snackbar.show('Category added', { type: 'success', duration: 4000, actionText: 'Undo', action: () => { this.remove(added.id, true); this.snackbar.show('Add undone', { duration: 2200, type: 'info' }); } });
    }

    // close modal if shown via page button
    if (this.showAddButton) this.showModal = false;

    // reset form
    this.model = { name: '', icon: '', parent: '' };
  }

  remove(id: number, skipConfirm = false){
    if (!skipConfirm) {
      if (!confirm('Delete this category?')) return;
    }
    const removed = this.categories.find(c => c.id === id);
    this.categories = this.categories.filter(c => c.id !== id);
    localStorage.setItem('categories', JSON.stringify(this.categories));
    if (removed) {
      this.snackbar.show('Category deleted', { duration: 4000, actionText: 'Undo', action: () => { this.categories.unshift(removed); localStorage.setItem('categories', JSON.stringify(this.categories)); this.snackbar.show('Restore successful', { duration: 2200, type: 'success' }); } });
    }
  }

  edit(c: Category){
    this.editingId = c.id;
    this.model = { name: c.name, icon: c.icon || '', parent: c.parent || '' };
    // if used as a page, open modal to edit, otherwise inline form is visible
    if (this.showAddButton) this.showModal = true;
  }

  cancelEdit(){
    this.editingId = null;
    this.model = { name:'', icon:'', parent:'' };
    if (this.showAddButton) this.showModal = false;
  }

}
