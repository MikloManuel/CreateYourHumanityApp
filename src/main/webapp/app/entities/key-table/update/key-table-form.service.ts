import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IKeyTable, NewKeyTable } from '../key-table.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IKeyTable for edit and NewKeyTableFormGroupInput for create.
 */
type KeyTableFormGroupInput = IKeyTable | PartialWithRequiredKeyOf<NewKeyTable>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IKeyTable | NewKeyTable> = Omit<T, 'created' | 'modified'> & {
  created?: string | null;
  modified?: string | null;
};

type KeyTableFormRawValue = FormValueOf<IKeyTable>;

type NewKeyTableFormRawValue = FormValueOf<NewKeyTable>;

type KeyTableFormDefaults = Pick<NewKeyTable, 'id' | 'created' | 'modified'>;

type KeyTableFormGroupContent = {
  id: FormControl<KeyTableFormRawValue['id'] | NewKeyTable['id']>;
  key: FormControl<KeyTableFormRawValue['key']>;
  created: FormControl<KeyTableFormRawValue['created']>;
  modified: FormControl<KeyTableFormRawValue['modified']>;
};

export type KeyTableFormGroup = FormGroup<KeyTableFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class KeyTableFormService {
  createKeyTableFormGroup(keyTable: KeyTableFormGroupInput = { id: null }): KeyTableFormGroup {
    const keyTableRawValue = this.convertKeyTableToKeyTableRawValue({
      ...this.getFormDefaults(),
      ...keyTable,
    });
    return new FormGroup<KeyTableFormGroupContent>({
      id: new FormControl(
        { value: keyTableRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      key: new FormControl(keyTableRawValue.key),
      created: new FormControl(keyTableRawValue.created),
      modified: new FormControl(keyTableRawValue.modified),
    });
  }

  getKeyTable(form: KeyTableFormGroup): IKeyTable | NewKeyTable {
    return this.convertKeyTableRawValueToKeyTable(form.getRawValue() as KeyTableFormRawValue | NewKeyTableFormRawValue);
  }

  resetForm(form: KeyTableFormGroup, keyTable: KeyTableFormGroupInput): void {
    const keyTableRawValue = this.convertKeyTableToKeyTableRawValue({ ...this.getFormDefaults(), ...keyTable });
    form.reset(
      {
        ...keyTableRawValue,
        id: { value: keyTableRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): KeyTableFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      created: currentTime,
      modified: currentTime,
    };
  }

  private convertKeyTableRawValueToKeyTable(rawKeyTable: KeyTableFormRawValue | NewKeyTableFormRawValue): IKeyTable | NewKeyTable {
    return {
      ...rawKeyTable,
      created: dayjs(rawKeyTable.created, DATE_TIME_FORMAT),
      modified: dayjs(rawKeyTable.modified, DATE_TIME_FORMAT),
    };
  }

  private convertKeyTableToKeyTableRawValue(
    keyTable: IKeyTable | (Partial<NewKeyTable> & KeyTableFormDefaults),
  ): KeyTableFormRawValue | PartialWithRequiredKeyOf<NewKeyTableFormRawValue> {
    return {
      ...keyTable,
      created: keyTable.created ? keyTable.created.format(DATE_TIME_FORMAT) : undefined,
      modified: keyTable.modified ? keyTable.modified.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
