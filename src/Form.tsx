import * as React from 'react';
import { Provider } from './helpers/context';
import { deriveInitial } from './helpers/deriveInitial';
import useState from './helpers/useState';
import { Errors, InitialValues, Touched } from './types';

interface CallBag {
  props: object;
  setErrors: (errors: Errors) => void;
  setFormError: (error: string) => void;
}

interface SuccessCallBag {
  resetForm: () => void;
}

export interface FormOptions<T> {
  enableReinitialize?: boolean;
  initialValues?: InitialValues;
  mapPropsToValues?: (props: object) => InitialValues;
  onError?: (error: object, setFormError: (error: any) => void) => void;
  onSuccess?: (result: any | undefined, callbag: SuccessCallBag) => void;
  onSubmit: (values: Partial<T>, callbag: CallBag) => Promise<any> | any;
  shouldSubmitWhenInvalid?: boolean;
  validate?: (values: Partial<T>) => object;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

const EMPTY_OBJ = {};

const OptionsContainer = <Values extends object>({
  enableReinitialize,
  initialValues: formInitialValues, // TODO: deprecate
  mapPropsToValues,
  onSubmit,
  validate,
  onError,
  onSuccess,
  shouldSubmitWhenInvalid,
  validateOnBlur,
  validateOnChange,
}: FormOptions<Values>) => {
  const initialValues = formInitialValues || EMPTY_OBJ;
  let isDirty = false;

  return function FormOuterWrapper(Component: React.ComponentType<any> | React.FC<any>) {
    return function FormWrapper(props: { [property: string]: any }) {
      const passDownProps = React.useMemo(() => (enableReinitialize ? Object.values(props) : []), [
        enableReinitialize && props,
      ]);

      const { 0: values, 1: setFieldValue, 2: setValuesState } = useState(() =>
        mapPropsToValues ? mapPropsToValues(props) : initialValues,
      );

      const { 0: touched, 1: touch, 2: setTouchedState } = useState(EMPTY_OBJ);

      const { 0: formErrors, 1: setFieldError, 2: setErrorState } = useState(EMPTY_OBJ);

      const { 0: isSubmitting, 1: setSubmitting } = React.useState(false);
      const { 0: formError, 1: setFormError } = React.useState();

      // The validation step in our form, this memoization happens on values and touched.
      const validateForm = React.useCallback(() => {
        const validationErrors = validate ? validate(values) : EMPTY_OBJ;
        setErrorState(validationErrors);
        return validationErrors;
      }, [values]);

      // Provide a way to reset the full form to the initialValues.
      const resetForm = React.useCallback(() => {
        isDirty = false;
        setValuesState(mapPropsToValues ? mapPropsToValues(props) : initialValues);
        setTouchedState(EMPTY_OBJ);
        setErrorState(EMPTY_OBJ);
      }, [...passDownProps]);

      const handleSubmit = React.useCallback(
        async (event?: React.FormEvent<HTMLFormElement>) => {
          if (event && event.preventDefault) event.preventDefault();

          const errors = validateForm();
          setTouchedState(deriveInitial(errors, true));
          if (!shouldSubmitWhenInvalid && Object.keys(errors).length > 0) {
            return setSubmitting(false);
          }

          return new Promise(resolve =>
            resolve(onSubmit(values, { props, setErrors: setErrorState, setFormError })),
          )
            .then((result: any) => {
              setSubmitting(false);
              if (onSuccess) onSuccess(result, { resetForm });
            })
            .catch((e: any) => {
              setSubmitting(false);
              if (onError) onError(e, setFormError);
            });
        },
        [values],
      );

      React.useEffect(() => {
        if (isSubmitting) handleSubmit();
      }, [isSubmitting]);

      // Make our listener for the reinitialization when need be.
      React.useEffect(() => {
        if (enableReinitialize) resetForm();
      }, [...passDownProps]);

      // Run validations when needed.
      React.useEffect(() => {
        if (validateOnBlur || validateOnChange) {
          validateForm();
        }
      }, [validateOnBlur && touched, validateOnChange && values]);

      // The onChange we can use for our Fields,
      // should also be renewed context wise when our touched are altered.
      const onChange = React.useCallback((fieldId: string, value: any) => {
        isDirty = true;
        setFieldValue(fieldId, value);
      }, []);

      const providerValue = React.useMemo(
        () => ({
          errors: formErrors as Errors,
          formError,
          isDirty,
          setFieldError,
          setFieldTouched: (fieldId: string, value?: boolean) => {
            touch(fieldId, value == null ? true : value);
          },
          setFieldValue: onChange,
          touched: touched as Touched,
          validate: validateForm,
          values,
        }),
        [formErrors, formError, isDirty, onChange, touched, validateForm, values],
      );

      const comp = React.useMemo(
        () => (
          <Component
            change={onChange}
            formError={formError}
            handleSubmit={(e?: React.SyntheticEvent) => {
              if (e && e.preventDefault) e.preventDefault();
              setSubmitting(() => true);
            }}
            isSubmitting={isSubmitting}
            resetForm={resetForm}
            isDirty={isDirty}
            {...props}
          />
        ),
        [...passDownProps, formError, isSubmitting],
      );

      return <Provider value={providerValue}>{comp}</Provider>;
    };
  };
};

export default OptionsContainer;
