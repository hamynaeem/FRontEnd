
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SnackbarService } from '../../components/shared/snackbar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, getCategories, createCategory, updateCategory, deleteCategory } from '../../components/stores/category-store';

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

  constructor(
    private snackbar: SnackbarService,
   ){}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(){
    getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load categories';
      }
    });
  }

  isImageIcon(icon?: string): boolean {
    if (!icon) return false;

    return /^(https?:\/\/|\/|assets\/).+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(icon.trim());
  }

  save(ev: Event){
    ev.preventDefault();
    this.error = '';
    const name = (this.model.name || '').trim();
    if(!name){
      this.error = 'Category name is required';
      return;
    }

    const payload = {
      name,
      icon: (this.model.icon || '').trim() || undefined,
      parent: (this.model.parent || '').trim() || undefined
    };

    if (this.editingId) {
      const idToUpdate = this.editingId;
      updateCategory(idToUpdate, payload).subscribe({
        next: (updatedCat) => {
          const idx = this.categories.findIndex(c => c.id === idToUpdate);
          if (idx > -1) {
            this.categories[idx] = updatedCat;
            try { this.saved.emit({ action: 'updated', item: updatedCat }); } catch {}
          }
          this.snackbar.show('Category updated', { type: 'success', duration: 2500 });
          this.cancelEdit();
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to update category';
        }
      });
    } else {
      createCategory(payload).subscribe({
        next: (newCat) => {
          this.categories.unshift(newCat);
          try { this.saved.emit(newCat); } catch {}
          
          // show snackbar with undo
          this.snackbar.show('Category added', {
            type: 'success',
            duration: 4000,
            actionText: 'Undo',
            action: () => {
              this.remove(newCat.id, true);
              this.snackbar.show('Add undone', { duration: 2200, type: 'info' });
            }
          });

          // close modal if shown via page button
          if (this.showAddButton) this.showModal = false;

          // reset form
          this.model = { name: '', icon: '', parent: '' };
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to add category';
        }
      });
    }
  }

  remove(id: number, skipConfirm = false){
    if (!skipConfirm) {
      if (!confirm('Delete this category?')) return;
    }
    const removed = this.categories.find(c => c.id === id);
    if (!removed) return;

    deleteCategory(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== id);
        this.snackbar.show('Category deleted', {
          duration: 4000,
          actionText: 'Undo',
          action: () => {
            const payload = {
              name: removed.name,
              icon: removed.icon || undefined,
              parent: removed.parent || undefined
            };
            createCategory(payload).subscribe({
              next: (restoredCat) => {
                this.categories.unshift(restoredCat);
                this.snackbar.show('Restore successful', { duration: 2200, type: 'success' });
              },
              error: (err) => {
                console.error(err);
                this.snackbar.show('Failed to restore category', { duration: 2200, type: 'error' });
              }
            });
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.snackbar.show('Failed to delete category', { duration: 2200, type: 'error' });
      }
    });
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
