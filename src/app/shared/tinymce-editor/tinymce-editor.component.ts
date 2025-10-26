import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { environment } from 'environments/environment.dev';

@Component({
  selector: 'app-tinymce-editor',
  imports: [
    EditorModule,
    FormsModule
  ],
  templateUrl: './tinymce-editor.component.html',
  styleUrl: './tinymce-editor.component.css'
})
export class TinymceEditorComponent {
  @Input() properties = {};
  public apiKeyTinymce = environment.apiKeyTinymce;
  content = '<p>Descripción del producto...</p>';

  ngOnInit(){
    console.log(this.apiKeyTinymce);
    
  }
}
