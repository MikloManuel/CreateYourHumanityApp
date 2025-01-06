import { Component } from '@angular/core';
import { Form, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MindmapXmlService } from 'app/entities/mindmap-xml/service/mindmap-xml.service';
import { first } from 'rxjs';
import { MindmapParserService } from 'app/mindmap-parser.service';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-form-container',
  templateUrl: './form-container.component.html',
  styleUrl: './form-container.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormlyModule],
})
export class FormContainerComponent {
  form: FormGroup = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  options: FormlyFormOptions = {};
  xmlSchema: string = '';
  xmlTextarea: string = '';

  constructor(
    private mindmapXmlService: MindmapXmlService,
    private mindmapParserService: MindmapParserService,
  ) {
    this.loadXmlFromDatabase();
  }

  parseXml(): void {
    if (this.xmlTextarea.trim()) {
      // Parse XML from textarea
      this.fields = this.mindmapParserService.parseXmlData(this.xmlTextarea);
    } else {
      // Load XML from database and parse
      this.loadXmlFromDatabase();
    }
  }

  loadXmlFromDatabase(): void {
    this.mindmapXmlService
      .query()
      .pipe(first())
      .subscribe(res => {
        if (res.body && res.body.length > 0) {
          this.xmlSchema = res.body[0].text!;
          this.mindmapParserService.parseXmlData(this.xmlSchema);
        }
      });
  }

  submit(): void {
    console.log(this.model);
  }
}
