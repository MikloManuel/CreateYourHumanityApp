import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFormulaData, NewFormulaData } from '../formula-data.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFormulaData for edit and NewFormulaDataFormGroupInput for create.
 */
type FormulaDataFormGroupInput = IFormulaData | PartialWithRequiredKeyOf<NewFormulaData>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFormulaData | NewFormulaData> = Omit<T, 'created' | 'modified'> & {
  created?: string | null;
  modified?: string | null;
};

type FormulaDataFormRawValue = FormValueOf<IFormulaData>;

type NewFormulaDataFormRawValue = FormValueOf<NewFormulaData>;

type FormulaDataFormDefaults = Pick<NewFormulaData, 'id' | 'created' | 'modified'>;

type FormulaDataFormGroupContent = {
  id: FormControl<FormulaDataFormRawValue['id'] | NewFormulaData['id']>;
  map: FormControl<FormulaDataFormRawValue['map']>;
  created: FormControl<FormulaDataFormRawValue['created']>;
  modified: FormControl<FormulaDataFormRawValue['modified']>;
  user: FormControl<FormulaDataFormRawValue['user']>;
};

export type FormulaDataFormGroup = FormGroup<FormulaDataFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FormulaDataFormService {
  createFormulaDataFormGroup(formulaData: FormulaDataFormGroupInput = { id: null }): FormulaDataFormGroup {
    const formulaDataRawValue = this.convertFormulaDataToFormulaDataRawValue({
      ...this.getFormDefaults(),
      ...formulaData,
    });
    return new FormGroup<FormulaDataFormGroupContent>({
      id: new FormControl(
        { value: formulaDataRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      map: new FormControl(formulaDataRawValue.map),
      created: new FormControl(formulaDataRawValue.created),
      modified: new FormControl(formulaDataRawValue.modified),
      user: new FormControl(formulaDataRawValue.user),
    });
  }

  getFormulaData(form: FormulaDataFormGroup): IFormulaData | NewFormulaData {
    return this.convertFormulaDataRawValueToFormulaData(form.getRawValue() as FormulaDataFormRawValue | NewFormulaDataFormRawValue);
  }

  resetForm(form: FormulaDataFormGroup, formulaData: FormulaDataFormGroupInput): void {
    const formulaDataRawValue = this.convertFormulaDataToFormulaDataRawValue({ ...this.getFormDefaults(), ...formulaData });
    form.reset(
      {
        ...formulaDataRawValue,
        id: { value: formulaDataRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FormulaDataFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      created: currentTime,
      modified: currentTime,
    };
  }

  private convertFormulaDataRawValueToFormulaData(
    rawFormulaData: FormulaDataFormRawValue | NewFormulaDataFormRawValue,
  ): IFormulaData | NewFormulaData {
    return {
      ...rawFormulaData,
      created: dayjs(rawFormulaData.created, DATE_TIME_FORMAT),
      modified: dayjs(rawFormulaData.modified, DATE_TIME_FORMAT),
    };
  }

  private convertFormulaDataToFormulaDataRawValue(
    formulaData: IFormulaData | (Partial<NewFormulaData> & FormulaDataFormDefaults),
  ): FormulaDataFormRawValue | PartialWithRequiredKeyOf<NewFormulaDataFormRawValue> {
    return {
      ...formulaData,
      created: formulaData.created ? formulaData.created.format(DATE_TIME_FORMAT) : undefined,
      modified: formulaData.modified ? formulaData.modified.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
