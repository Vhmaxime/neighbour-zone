import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-post-button',
  standalone: true,
  imports: [RouterLink],
 template: `
    <button
      routerLink="/posts/create"
      class="fixed bottom-8 right-8 flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 z-50 group"
      title="Create a new post"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span class="font-bold hidden md:inline">Create Post</span>
    </button>
  `
})
export class CreatePostButton {

}
