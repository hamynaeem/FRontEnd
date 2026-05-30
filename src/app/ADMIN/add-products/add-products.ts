
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../components/shared/snackbar.service';
import { CategoryService } from '../../components/services/category.service';

interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
  description?: string;
  image?: string;
  specs?: {
    ram?: string;
    rom?: string;
    battery?: string;
    display?: string;
    camera?: string;
    processor?: string;
  };
}

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
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(){
    try{
      const raw = localStorage.getItem('products');
      this.products = raw ? JSON.parse(raw) : [];
    }catch{
      this.products = [];
    }
  }

  private loadCategories(){
    this.categoryService.getCategories().subscribe({
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

    if(this.editingId){
      const idx = this.products.findIndex(p => p.id === this.editingId);
      if(idx > -1){
        this.products[idx] = {
          id: this.editingId,
          name,
          price,
          category: (this.model.category || '').trim() || undefined,
          description: (this.model.description || '').trim() || undefined,
          image: (this.model.image || '').trim() || undefined,
          specs
        };
        localStorage.setItem('products', JSON.stringify(this.products));
        try{ this.saved.emit({ action: 'updated', item: this.products[idx] }); }catch{}
        this.snackbar.show('Product updated', { type: 'success', duration: 2500 });
      }
      this.editingId = null;
    } else {
      const prod: Product = {
        id: Date.now(),
        name,
        price,
        category: (this.model.category || '').trim() || undefined,
        description: (this.model.description || '').trim() || undefined,
        image: (this.model.image || '').trim() || undefined,
        specs
      };
      this.products.unshift(prod);
      localStorage.setItem('products', JSON.stringify(this.products));
      try{ this.saved.emit(prod); }catch{}
      const added = prod;
      this.snackbar.show('Product added', { type: 'success', duration: 4000, actionText: 'Undo', action: () => { this.remove(added.id, true); this.snackbar.show('Add undone', { duration: 2200, type: 'info' }); } });
    }

    if(this.showAddButton) this.showModal = false;
    this.model = { name: '', price: 0, category: '', description: '', image: '', specs: { ram: '', rom: '', battery: '', display: '', camera: '', processor: '' } };
  }

  remove(id: number, skipConfirm = false){
    if(!skipConfirm){
      if(!confirm('Delete this product?')) return;
    }
    const removed = this.products.find(p => p.id === id);
    this.products = this.products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(this.products));
    if(removed){
      this.snackbar.show('Product deleted', { duration: 4000, actionText: 'Undo', action: () => { this.products.unshift(removed); localStorage.setItem('products', JSON.stringify(this.products)); this.snackbar.show('Restore successful', { duration: 2200, type: 'success' }); } });
    }
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
