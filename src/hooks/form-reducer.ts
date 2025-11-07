import { useReducer } from "react";

enum FormReducerActionTypes {
  CHANGE_TEXT = "CHANGE_TEXT",
  CLEAR_FORM = "CLEAR_FORM",
}

function formReducerClosure<T>(initialFormState: T) {
  return function formReducerFunction<T>(
    state: T,
    action: { type: FormReducerActionTypes; field: string; payload: string }
  ) {
    switch (action.type) {
      case FormReducerActionTypes.CHANGE_TEXT:
        return {
          ...state,
          [action.field]: action.payload,
        };
      case FormReducerActionTypes.CLEAR_FORM:
        return { ...initialFormState };
      default:
        return state;
    }
  };
}

function useFormReducer<T>(initialFormState: T) {
  const [formData, dispatch] = useReducer(
    formReducerClosure<T>(initialFormState),
    initialFormState
  );

  return { formData, dispatch };
}

export { useFormReducer, FormReducerActionTypes };
