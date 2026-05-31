
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../components/shared/snackbar.service';
import { getCategories } from '../../components/stores/category-store';
import { getProducts, createProduct, updateProduct, deleteProduct, Product, ProductPayload } from '../../components/stores/product-store';

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-products.html',
  styleUrls: ['./add-products.css'],
})
export class AddProducts implements OnInit {
  @Output() saved = new EventEmitter<any>();
  @Input() showAddButton = true;
  showModal = false;
  model: any = { name: '', price: 0, category: '', description: '', image: '', specs: { ram: '', rom: '', battery: '', display: '', camera: '', processor: '' } };
  products: Product[] = [];
  editingId: number | null = null;
  error = '';
  categories: any[] = [];

  constructor(
    private snackbar: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(){
    getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error(err);
        this.products = [];
        this.error = 'Failed to load products';
      }
    });
  }

  private loadCategories(){
    getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
        this.categories = [];
      }
    });
  }

  save(ev: Event){
    ev.preventDefault();
    this.error = '';
    const name = (this.model.name || '').trim();
    const price = Number(this.model.price) || 0;
    if(!name){
      this.error = 'Product name is required';
      return;
    }
    if(isNaN(price) || price < 0){
      this.error = 'Please enter a valid price';
      return;
    }

    const specs = {
      ram: (this.model.specs?.ram || '').trim() || undefined,
      rom: (this.model.specs?.rom || '').trim() || undefined,
      battery: (this.model.specs?.battery || '').trim() || undefined,
      display: (this.model.specs?.display || '').trim() || undefined,
      camera: (this.model.specs?.camera || '').trim() || undefined,
      processor: (this.model.specs?.processor || '').trim() || undefined,
    };

    const payload: ProductPayload = {
      name,
      price,
      category: (this.model.category || '').trim() || undefined,
      description: (this.model.description || '').trim() || undefined,
      image: (this.model.image || '').trim() || undefined,
      specs
    };

    if(this.editingId){
      const idToUpdate = this.editingId;
      updateProduct(idToUpdate, payload).subscribe({
        next: (updatedProduct) => {
          const idx = this.products.findIndex(p => p.id === idToUpdate);
          if(idx > -1){
            this.products[idx] = updatedProduct;
          }
          try{ this.saved.emit({ action: 'updated', item: updatedProduct }); }catch{}
          this.snackbar.show('Product updated', { type: 'success', duration: 2500 });
          this.cancelEdit();
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to update product';
        }
      });
    } else {
      createProduct(payload).subscribe({
        next: (newProduct) => {
          this.products.unshift(newProduct);
          try{ this.saved.emit(newProduct); }catch{}
          this.snackbar.show('Product added', {
            type: 'success',
            duration: 4000,
            actionText: 'Undo',
            action: () => {
              this.remove(newProduct.id, true);
              this.snackbar.show('Add undone', { duration: 2200, type: 'info' });
            }
          });

          if(this.showAddButton) this.showModal = false;
          this.model = { name: '', price: 0, category: '', description: '', image: '', specs: { ram: '', rom: '', battery: '', display: '', camera: '', processor: '' } };
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to add product';
        }
      });
    }
  }

  remove(id: number, skipConfirm = false){
    if(!skipConfirm){
      if(!confirm('Delete this product?')) return;
    }
    const removed = this.products.find(p => p.id === id);
    if(!removed) return;

    deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
        this.snackbar.show('Product deleted', {
          duration: 4000,
          actionText: 'Undo',
          action: () => {
            const payload: ProductPayload = {
              name: removed.name,
              price: removed.price,
              category: removed.category || undefined,
              description: removed.description || undefined,
              image: removed.image || undefined,
              specs: removed.specs || undefined
            };
            createProduct(payload).subscribe({
              next: (restoredProduct) => {
                this.products.unshift(restoredProduct);
                this.snackbar.show('Restore successful', { duration: 2200, type: 'success' });
              },
              error: (err) => {
                console.error(err);
                this.snackbar.show('Failed to restore product', { duration: 2200, type: 'error' });
              }
            });
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.snackbar.show('Failed to delete product', { duration: 2200, type: 'error' });
      }
    });
  }

  edit(p: Product){
    this.editingId = p.id;
    this.model = { name: p.name, price: p.price, category: p.category || '', description: p.description || '', image: p.image || '', specs: Object.assign({ ram: '', rom: '', battery: '', display: '', camera: '', processor: '' }, p.specs || {}) };
    if(this.showAddButton) this.showModal = true;
  }

  cancelEdit(){
    this.editingId = null;
    this.model = { name: '', price: 0, category: '', description: '', image: '', specs: { ram: '', rom: '', battery: '', display: '', camera: '', processor: '' } };
    if(this.showAddButton) this.showModal = false;
  }
}
