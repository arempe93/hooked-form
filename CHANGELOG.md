# Releases

## 3.2.0

- Add `setError` to the context

## 3.1.1

- Don't validate on initial mount

## 3.1.0

- Add `resetForm` to the payload of `onSuccess`

## 3.0.0

- Update onSubmit to contain an object of props and errorSetters
- Rename FieldArray.render to FieldArray.children

## 2.3.0

- Use `use-context-selector` to drastically improve performance

## 2.2.0

- Added generics for `useField`, `useFieldArray` and `Form` by [Pruxis](https://github.com/Pruxis) in [PR #41](https://github.com/JoviDeCroock/hooked-form/pull/41)

## 2.1.0

- Performance improvements

## 2.0.0

- A lot of internal changes with a bundle size goal.

### Form

- don't pass validate values and touched to the Component, if needed they can be retrived through useFormConnect.

### FieldArray + useFieldArray

- lose `Element` postfix on operations
- values -> value
- resetField got depreacated

### Field + useField

- resetField got deprecated

## 1.6.0

- update redundant if-statements by [Pruxis](https://github.com/Pruxis) in [PR #22](https://github.com/JoviDeCroock/hooked-form/pull/22)
- provide useFormConnect to replace deprecated feature
- rewrite to a more performant deriveInitial
- add isDirty param injected in context and formWrapper
- fix bug where toPath would not work with two numbers

## 1.5.2

- Bug fixed where an array of non-object values would fail in deriving initial

## 1.5.1

- Linter applied to all files now, bug in previous config
- Performance improvement in deriving initial input by [Pruxis](https://github.com/Pruxis) in [PR #20](https://github.com/JoviDeCroock/hooked-form/pull/20)
- Bug fixed where null would fail in deriving initial
