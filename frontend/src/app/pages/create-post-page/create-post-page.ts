import { Component, inject } from '@angular/core';
import { Api } from '../../services/api';

@Component({
  selector: 'app-create-post-page',
  imports: [],
  templateUrl: './create-post-page.html',
  styleUrl: './create-post-page.css',
})
export class CreatePostPage {
  private api = inject(Api);

  // public createPost(title: string, content: string) {
  //   this.api.createPost({ title, content }).subscribe({
  //     next: (response) => {
  //       console.log('Post created successfully:', response);
  //     },
  //     error: (error) => {
  //       console.error('Error creating post:', error);
  //     },
  //   });
  // }
}
