import { PipeTransform, Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'figure', 'figcaption', 'video', 'source',
    'iframe', 'br', 'hr',
  ]),
  allowedAttributes: {
    '*': ['style', 'class', 'id'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'video': ['src', 'controls', 'width', 'height'],
    'source': ['src', 'type'],
    'iframe': ['src', 'width', 'height', 'allowfullscreen'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedStyles: {
    '*': {
      'color': [/^#(0x)?[0-9a-fA-F]+$/i, /^rgb\(/],
      'background-color': [/^#(0x)?[0-9a-fA-F]+$/i],
      'text-align': [/^left$/, /^right$/, /^center$/],
      'font-size': [/^\d+(?:px|em|%)$/],
    },
  },
  disallowedTagsMode: 'discard',
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
};

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, SANITIZE_OPTIONS);
    }
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        if (typeof value[key] === 'string') {
          value[key] = sanitizeHtml(value[key], SANITIZE_OPTIONS);
        }
      }
    }
    return value;
  }
}
