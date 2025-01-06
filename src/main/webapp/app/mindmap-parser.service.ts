import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

interface MindmapNode {
  id: string;
  text: string;
  element: string;
  attributes: { [key: string]: string };
  children: MindmapNode[];
}

@Injectable({
  providedIn: 'root',
})
export class MindmapParserService {
  parseXmlData(xmlData: string): FormlyFieldConfig[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
    const rootTopic = xmlDoc.querySelector('topic[central="true"]');

    if (!rootTopic) {
      throw new Error('Invalid mindmap structure');
    }

    return this.convertToFormlyConfig(this.parseNode(rootTopic));
  }

  private parseNode(element: Element): MindmapNode {
    const node: MindmapNode = {
      id: element.getAttribute('id') ?? '',
      text: element.getAttribute('text') ?? '',
      element: element.tagName.toLowerCase(),
      attributes: {},
      children: [],
    };

    // Parse other attributes
    Array.from(element.attributes).forEach(attr => {
      if (attr.name !== 'id' && attr.name !== 'text') {
        node.attributes[attr.name] = attr.value;
      }
    });

    // Parse children
    Array.from(element.children).forEach(child => {
      node.children.push(this.parseNode(child));
    });
    return node;
  }

  private convertToFormlyConfig(node: MindmapNode): FormlyFieldConfig[] {
    switch (node.element) {
      case 'page':
        return [this.convertPageToFormlyConfig(node)];
      case 'tabs':
        return [this.convertTabsToFormlyConfig(node)];
      case 'fieldset':
        return [this.convertFieldsetToFormlyConfig(node)];
      case 'tab':
        return [this.convertTabToFormlyConfig(node)];
      case 'topic':
        // Behandle 'topic' als Gruppierung
        return [
          {
            fieldGroupClassName: 'topic-group',
            templateOptions: { label: node.text },
            fieldGroup: node.children.flatMap(child => this.convertToFormlyConfig(child)),
          },
        ];
      default:
        // Für andere Typen konvertieren wir sie zu einem einzelnen Feld
        return [this.convertFieldToFormlyConfig(node)];
    }
  }

  private convertPageToFormlyConfig(node: MindmapNode): FormlyFieldConfig {
    return {
      type: 'page',
      wrappers: ['colored-wrapper'],
      templateOptions: {
        label: node.text,
        menuItems: [],
      },
      fieldGroup: node.children.map(child => this.convertToFormlyConfig(child)).flat(),
    };
  }

  private convertTabsToFormlyConfig(node: MindmapNode): FormlyFieldConfig {
    return {
      type: 'tabs',
      fieldGroup: node.children.map(tab => this.convertTabToFormlyConfig(tab)),
    };
  }

  private convertTabToFormlyConfig(node: MindmapNode): FormlyFieldConfig {
    return {
      templateOptions: {
        label: node.text,
      },
      fieldGroup: node.children.map(field => this.convertFieldToFormlyConfig(field)),
    };
  }

  private convertFieldsetToFormlyConfig(node: MindmapNode): FormlyFieldConfig {
    return {
      type: 'fieldset',
      templateOptions: {
        label: node.text,
      },
      fieldGroup: node.children.map(field => this.convertFieldToFormlyConfig(field)),
    };
  }

  private convertDefaultToFormlyConfig(node: MindmapNode): FormlyFieldConfig {
    return {};
  }

  private convertFieldToFormlyConfig(node: MindmapNode): FormlyFieldConfig {
    // Prüfen, ob es sich um ein einzelnes Formularelement handelt
    const t = [
      'textfield',
      'textarea',
      'select',
      'checkbox',
      'radio',
      'time',
      'ratings',
      'chips',
      'address',
      'editor',
      'option',
      'date',
    ].includes(node.element);
    if (t) {
      return {
        key: node.attributes['_id'],
        type: node.element,
        wrappers: ['grant'],
        templateOptions: {
          label: node.text,
          required: node.attributes['_required'] === 'true',
          disabled: node.attributes['_disabled'] === 'true',
          // Add more template options based on the attributes
        },
      };
    } else {
      // Wenn es sich nicht um ein einzelnes Formularelement handelt, rufen wir die entsprechende Konvertierungsmethode auf
      switch (node.element) {
        case 'page':
          return this.convertPageToFormlyConfig(node);
        case 'fieldset':
          return this.convertFieldsetToFormlyConfig(node);
        case 'tabs':
          return this.convertTabsToFormlyConfig(node);
        case 'tab':
          return this.convertTabToFormlyConfig(node);
        // Fügen Sie hier weitere Fälle hinzu, falls erforderlich
        default:
          // Für unbekannte Typen können wir eine Standardkonvertierung durchführen oder eine Ausnahme werfen
          return this.convertDefaultToFormlyConfig(node);
      }
    }
  }
}
