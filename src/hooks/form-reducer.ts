import { useReducer } from "react";
import { UserCreateForm } from "../components/auth/Signup";

enum FormReducerActionTypes {
  CHANGE_TEXT = "CHANGE_TEXT",
  CHANGE_ROLE = "CHANGE_ROLE",
  APPEND_ARRAY = "APPEND_ARRAY",
  DEDUCT_ARRAY = "DEDUCT_ARRAY",
  ADD_TIME_TO_ARRAY = "ADD_OBJ_TO_ARRAY",
  EDIT_ARRAY_OBJ = "EDIT_ARRAY",
  CLEAR_FORM = "CLEAR_FORM",
}

function isUserCreateForm(form: unknown): form is UserCreateForm {
  return (form as UserCreateForm).role !== undefined;
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
      // For auth stuff only
      case FormReducerActionTypes.CHANGE_ROLE:
        if (!isUserCreateForm(initialFormState)) {
          return state;
        }

        return { ...initialFormState, role: action.payload } as T;
      case FormReducerActionTypes.APPEND_ARRAY:
        const append_field = action.field as keyof typeof state;
        const append_current_field = state[append_field];
        if (!Array.isArray(append_current_field)) {
          return state;
        }
        const append_array = [...append_current_field, action.payload];
        return { ...state, [append_field]: append_array };
      case FormReducerActionTypes.DEDUCT_ARRAY:
        const deduct_field = action.field as keyof typeof state;
        const deduct_current_field = state[deduct_field];
        if (!Array.isArray(deduct_current_field)) {
          return state;
        }

        const deducted_array = deduct_current_field.filter(
          (element) => element !== action.payload
        );

        return { ...state, [deduct_field]: deducted_array } as T;
      // Expects payload in the string form: index property value
      case FormReducerActionTypes.ADD_TIME_TO_ARRAY:
        const add_field = action.field as keyof typeof state;
        const add_current_field = state[add_field];

        if (!Array.isArray(add_current_field)) {
          return state;
        }

        const new_appended_array = [
          ...add_current_field,
          {
            dayOfWeek: null,
            startTime: null,
            endTime: null,
          },
        ];
        console.log(new_appended_array);

        return { ...state, [add_field]: new_appended_array };
      case FormReducerActionTypes.EDIT_ARRAY_OBJ:
        const edit_field = action.field as keyof typeof state;
        const edit_current_field = state[edit_field];

        if (!Array.isArray(edit_current_field)) {
          return state;
        }
        const [index, property, value] = action.payload.split(" ");
        if (isNaN(parseInt(index))) {
          return state;
        }
        const arrayIndex = parseInt(index);
        const edit_obj = edit_current_field[arrayIndex];
        edit_obj[property] = value;
        edit_current_field[arrayIndex] = edit_obj;

        return { ...state, [edit_field]: edit_current_field } as T;

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
