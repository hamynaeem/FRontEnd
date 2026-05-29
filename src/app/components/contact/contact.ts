import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {
  model = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  reset(){
    this.model = { name:'', email:'', phone:'', message:'' };
  }

  sendWhatsApp(ev: Event){
    ev.preventDefault();
    const phone = (this.model.phone || '').replace(/[^+0-9]/g, '');
    if (!phone) {
      alert('Please enter a valid phone number including country code.');
      return;
    }

    const textParts = [
      `Name: ${this.model.name}`,
      `Email: ${this.model.email}`,
      `Phone: ${this.model.phone}`,
      '',
      this.model.message
    ];

    const text = encodeURIComponent(textParts.join('\n'));

    // Use wa.me link format which works both on mobile and web WhatsApp
    const waUrl = `https://wa.me/${phone.replace(/^\+/, '')}?text=${text}`;
    window.open(waUrl, '_blank');
  }
}
