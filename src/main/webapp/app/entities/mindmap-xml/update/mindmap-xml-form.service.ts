import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IMindmapXml, NewMindmapXml } from '../mindmap-xml.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMindmapXml for edit and NewMindmapXmlFormGroupInput for create.
 */
type MindmapXmlFormGroupInput = IMindmapXml | PartialWithRequiredKeyOf<NewMindmapXml>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IMindmapXml | NewMindmapXml> = Omit<T, 'modified'> & {
  modified?: string | null;
};

type MindmapXmlFormRawValue = FormValueOf<IMindmapXml>;

type NewMindmapXmlFormRawValue = FormValueOf<NewMindmapXml>;

type MindmapXmlFormDefaults = Pick<NewMindmapXml, 'id' | 'modified'>;

type MindmapXmlFormGroupContent = {
  id: FormControl<MindmapXmlFormRawValue['id'] | NewMindmapXml['id']>;
  text: FormControl<MindmapXmlFormRawValue['text']>;
  modified: FormControl<MindmapXmlFormRawValue['modified']>;
};

export type MindmapXmlFormGroup = FormGroup<MindmapXmlFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MindmapXmlFormService {
  createMindmapXmlFormGroup(mindmapXml: MindmapXmlFormGroupInput = { id: null }): MindmapXmlFormGroup {
    const mindmapXmlRawValue = this.convertMindmapXmlToMindmapXmlRawValue({
      ...this.getFormDefaults(),
      ...mindmapXml,
    });
    return new FormGroup<MindmapXmlFormGroupContent>({
      id: new FormControl(
        { value: mindmapXmlRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      text: new FormControl(mindmapXmlRawValue.text),
      modified: new FormControl(mindmapXmlRawValue.modified),
    });
  }

  getMindmapXml(form: MindmapXmlFormGroup): IMindmapXml | NewMindmapXml {
    return this.convertMindmapXmlRawValueToMindmapXml(form.getRawValue() as MindmapXmlFormRawValue | NewMindmapXmlFormRawValue);
  }

  resetForm(form: MindmapXmlFormGroup, mindmapXml: MindmapXmlFormGroupInput): void {
    const mindmapXmlRawValue = this.convertMindmapXmlToMindmapXmlRawValue({ ...this.getFormDefaults(), ...mindmapXml });
    form.reset(
      {
        ...mindmapXmlRawValue,
        id: { value: mindmapXmlRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): MindmapXmlFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      modified: currentTime,
    };
  }

  private convertMindmapXmlRawValueToMindmapXml(
    rawMindmapXml: MindmapXmlFormRawValue | NewMindmapXmlFormRawValue,
  ): IMindmapXml | NewMindmapXml {
    return {
      ...rawMindmapXml,
      modified: dayjs(rawMindmapXml.modified, DATE_TIME_FORMAT),
    };
  }

  private convertMindmapXmlToMindmapXmlRawValue(
    mindmapXml: IMindmapXml | (Partial<NewMindmapXml> & MindmapXmlFormDefaults),
  ): MindmapXmlFormRawValue | PartialWithRequiredKeyOf<NewMindmapXmlFormRawValue> {
    return {
      ...mindmapXml,
      modified: mindmapXml.modified ? mindmapXml.modified.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
